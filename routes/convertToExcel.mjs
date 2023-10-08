import express from "express";
import schedule from "node-schedule";
import ExcelJS from "exceljs";
import sgMail from "@sendgrid/mail";
import ReportFieldsModel from "../models/reportFieldsModel.mjs";
import JobModel from "../models/jobModel.mjs";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

sgMail.setApiKey(process.env.SENDGRID_API);

// schedule.scheduleJob("*/10 * * * * *", async () => {
schedule.scheduleJob("00 22 * * */1", async () => {
  try {
    // Get the current date
    const currentDate = new Date();
    const yearLastTwoDigits = currentDate.getFullYear() % 100;
    const year = yearLastTwoDigits;
    const nextYear = yearLastTwoDigits + 1;

    // Find the importerURL and email from reportFields collection
    const reportFieldsData = await ReportFieldsModel.find(
      {},
      "importer importerURL email senderEmail field"
    );

    // Find the jobs for the given year range
    const jobsData = await JobModel.find({
      year: `${year}-${nextYear}`,
      status: "Pending",
    });

    // Generate Excel files for each importer with their respective job data
    for (const reportField of reportFieldsData) {
      const matchingJobData = jobsData.filter(
        (job) => job.importerURL === reportField.importerURL
      );

      if (matchingJobData) {
        const worksheetName = reportField.importer;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");

        /////////////////////////////////////  Title Row  //////////////////////////////////////
        const titleRow = worksheet.getRow(1);
        const endColumnIndex = reportField.field.length - 1;
        const endColumn =
          endColumnIndex < 26
            ? String.fromCharCode(65 + endColumnIndex)
            : String.fromCharCode(64 + Math.floor(endColumnIndex / 26)) +
              String.fromCharCode(65 + (endColumnIndex % 26));
        worksheet.mergeCells(`A1:${endColumn}1`);
        titleRow.getCell(1).value = `${
          reportField.importer
        }: Status as of ${currentDate.toLocaleDateString("en-GB")}`;

        // Apply formatting to the title row
        titleRow.font = { size: 12, color: { argb: "FFFFFFFF" } };
        titleRow.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "4472c4" },
        };
        titleRow.alignment = { horizontal: "center", vertical: "middle" };

        // Set text alignment and borders for the title row
        titleRow.eachCell({ includeEmpty: true }, (cell) => {
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
        titleRow.height = 40;

        /////////////////////////////////////  Header Row  //////////////////////////////////////
        const headerRow = worksheet.getRow(2);
        reportField.field.forEach((fieldName, index) => {
          headerRow.getCell(index + 1).value = fieldName;
        });

        headerRow.font = { size: 12, color: { argb: "FFFFFFFF" } };
        headerRow.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "4472c4" },
        };

        // Set text alignment to center for each cell in the header row
        headerRow.eachCell({ includeEmpty: true }, (cell) => {
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });

        // Increase the height of the header row
        headerRow.height = 35;

        /////////////////////////////////////  Data Row  //////////////////////////////////////
        // Sort jobs based on detailed_status priority or move empty detailed_status to the end
        matchingJobData.sort((a, b) => {
          const statusPriority = {
            "Custom Clearance Completed": 1,
            "BE Noted, Clearance Pending": 2,
            "BE Noted, Arrival Pending": 3,
            Discharged: 4,
            "Gateway IGM Filed": 5,
            "Estimated Time of Arrival": 6,
          };

          const statusA = a.detailed_status;
          const statusB = b.detailed_status;

          if (statusA === "" && statusB === "") {
            // If both have empty detailed_status, keep their relative order
            return 0;
          } else if (statusA === "") {
            // Put empty detailed_status at the end
            return 1;
          } else if (statusB === "") {
            // Put empty detailed_status at the end
            return -1;
          } else {
            // Use the priority values for sorting non-empty detailed_status
            return statusPriority[statusA] - statusPriority[statusB];
          }
        });

        matchingJobData
          .filter((job) => job.status.toLowerCase() === "pending")
          .forEach((job) => {
            const arrivalDates = job.container_nos
              .map((container) => container.arrival_date)
              .join(",\n");

            const containerNumbers = job.container_nos
              .map((container) => container.container_number)
              .join(",\n");

            const detentionFrom = job.container_nos
              .map((container) => container.detention_from)
              .join(",\n");

            const size = job.container_nos
              .map((container) => container.size)
              .join(",\n");

            const inv_value = (job.cif_amount / parseInt(job.exrate)).toFixed(
              2
            );
            const invoice_value_and_unit_price = `${job.inv_currency} ${inv_value} | ${job.unit_price}`;

            const valueMap = {
              "JOB NO": job.job_no,
              "CUSTOM HOUSE": job.custom_house,
              "SIMS REG NO": job.sims_reg_no,
              "JOB DATE": job.job_date,
              IMPORTER: job.importer,
              "SUPPLIER/ EXPORTER": job.supplier_exporter,
              "INVOICE NUMBER": job.invoice_number,
              "INVOICE DATE": job.invoice_date,
              "AWB/ BL NUMBER": job.awb_bl_no,
              "AWB/ BL DATE": job.awb_bl_date,
              COMMODITY: job.description,
              "BE NUMBER": job.be_no,
              "BE DATE": job.be_date,
              "TYPE OF BE": job.type_of_b_e,
              "NUMBER OF PACKAGES": job.no_of_pkgs,
              UNIT: job.unit,
              "GROSS WEIGHT": job.gross_weight,
              "GATEWAY IGM": job.gateway_igm,
              "GATEWAY IGM DATE": job.gateway_igm_date,
              "IGM NUMBER": job.igm_no,
              "IGM DATE": job.igm_date,
              "LOADING PORT": job.loading_port,
              "ORIGIN COUNTRY": job.origin_country,
              "PORT OF REPORTING": job.port_of_reporting,
              "SHIPPING LINE": job.shipping_line_airline,
              "CONTAINER NUMBER": containerNumbers,
              "ARRIVAL DATE": arrivalDates,
              "DETENTION FROM": detentionFrom,
              SIZE: size,
              "CONTAINER COUNT": job.container_count,
              "NO OF CONTAINER": job.no_of_container,
              TOI: job.toi,
              "UNIT PRICE": job.unit_price,
              "CIF AMOUNT": job.cif_amount,
              "ASSBL VALUE": job.assbl_value,
              "TOTAL DUTY": job.total_duty,
              "OUT OF CHARGE": job.out_of_charge,
              "CONSIGNMENT TYPE": job.consignment_type,
              "BILL NUMBER": job.bill_no,
              "BILL DATE": job.bill_date,
              "CTH NUMBER": job.cth_no,
              STATUS: job.status,
              "DETAILED STATUS": job.detailed_status,
              CHECKLIST: job.checklist,
              "DO VALIDITY": job.do_validity,
              ETA: job.eta,
              "FREE TIME": job.free_time,
              "INVOICE VALUE AND UNIT PRICE": invoice_value_and_unit_price,
              REMARKS: job.remarks,
              "ASSESSMENT DATE": job.assessment_date,
              "EXAMINATION DATE": job.examination_date,
              "DUTY PAID DATE": job.duty_paid_date,
              "OUT OF CHARGE DATE": job.out_of_charge_date,
            };

            const selectedValues = reportField.field.map((val) => {
              if (valueMap[val]) {
                return valueMap[val];
              } else if (val === "CONTAINER NUMBER") {
                return containerNumbers;
              } else if (val === "ARRIVAL DATE") {
                return arrivalDates;
              } else if (val === "DETENTION FROM") {
                return detentionFrom;
              } else if (val === "SIZE") {
                return size;
              }
              return "";
            });

            const dataRow = worksheet.addRow(selectedValues);

            // Apply background color based on Detailed Status
            if (job.detailed_status === "Estimated Time of Arrival") {
              dataRow.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFFFFFFF" },
              };
            } else if (job.detailed_status === "Custom Clearance Completed") {
              dataRow.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFCCFFFF" },
              };
            } else if (job.detailed_status === "Discharged") {
              dataRow.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFF4B183" },
              };
            } else if (job.detailed_status === "BE Noted, Arrival Pending") {
              dataRow.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "f4b083" },
              };
            } else if (job.detailed_status === "BE Noted, Clearance Pending") {
              dataRow.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF8EAADB" },
              };
            } else if (job.detailed_status === "Gateway IGM Filed") {
              dataRow.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "ffff66" },
              };
            }

            dataRow.eachCell({ includeEmpty: true }, (cell) => {
              cell.alignment = {
                horizontal: "center",
                vertical: "middle",
                wrapText: true, // Enable text wrapping for all cells
              };

              cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
              };

              // Add line breaks after commas in the containerNumbers cell
              if (cell.value && cell.value.toString().includes(",\n")) {
                cell.value = cell.value.replace(
                  /,\n/g,
                  String.fromCharCode(10)
                ); // Replace ",\n" with line break character
              }
            });

            // Adjust row height based on content
            const rowHeight = calculateRowHeight(dataRow);

            // Set the calculated row height
            dataRow.height = rowHeight;

            // Function to calculate row height based on content
            function calculateRowHeight(row) {
              let maxHeight = 0;

              row.eachCell({ includeEmpty: true }, (cell) => {
                const lines = cell.value
                  ? cell.value.toString().split(/\r\n|\r|\n/)
                  : [];
                const lineCount = lines.length;
                cell.border = {
                  top: { style: "thin" },
                  left: { style: "thin" },
                  bottom: { style: "thin" },
                  right: { style: "thin" },
                };

                // Set a minimum height for the row
                let cellHeight = 50;

                // Calculate the required height for the cell based on the number of lines
                if (lineCount > 1) {
                  const defaultFontSize = 12; // Set the default font size used in the cell
                  const lineSpacing = 2; // Set the additional spacing between lines

                  const totalLineHeight =
                    lineCount * defaultFontSize + (lineCount - 1) * lineSpacing;

                  // Add padding to the calculated line height
                  const padding = 10;

                  cellHeight = totalLineHeight + padding;
                }

                // Update the maximum cell height for the row
                if (cellHeight > maxHeight) {
                  maxHeight = cellHeight;
                }
              });

              return maxHeight;
            }

            // Adjust column widths based on content
            worksheet.columns.forEach((column, id) => {
              let maxLength = 0;

              column.eachCell({ includeEmpty: true }, (cell) => {
                maxLength = 10;
                cell.border = {
                  top: { style: "thin" },
                  left: { style: "thin" },
                  bottom: { style: "thin" },
                  right: { style: "thin" },
                };
              });

              if (reportField.field[id] !== "CONTAINER NUMBER") {
                column.width = maxLength < 25 ? 25 : maxLength;
              }
              if (reportField.field[id] === "JOB NO") {
                column.width = 10;
              }
              if (reportField.field[id] === "BE NUMBER") {
                column.width = 15;
              }
              if (reportField.field[id] === "BE DATE") {
                column.width = 18;
              }
              if (reportField.field[id] === "TYPE OF BE") {
                column.width = 15;
              }
              if (reportField.field[id] === "UNIT") {
                column.width = 12;
              }
              if (reportField.field[id] === "CONTAINER NUMBER") {
                column.width = 30;
              }
              if (reportField.field[id] === "INVOICE VALUE AND UNIT PRICE") {
                column.width = 35;
              }
              if (reportField.field[id] === "IMPORTER") {
                column.width = 40;
              }
              if (reportField.field[id] === "SHIPPING LINE") {
                column.width = 40;
              }
              if (reportField.field[id] === "DESCRIPTION") {
                column.width = 50;
              }
              if (reportField.field[id] === "SIZE") {
                column.width = 10;
              }
              if (reportField.field[id] === "FREE TIME") {
                column.width = 12;
              }
              if (reportField.field[id] === "SUPPLIER/ EXPORTER") {
                column.width = 30;
              }
              if (reportField.field[id] === "STATUS") {
                column.width = 15;
              }
            });
          });

        /////////////////////////////////////  Additional Table  //////////////////////////////////////
        // Add a new section for the additional table
        worksheet.addRow([]);
        worksheet.addRow([]);
        worksheet.addRows([]);

        // Define the content for the additional table
        const additionalTableData = [
          { color: "FFCCFFFF", text: "CUSTOM CLEARANCE COMPLETED" },
          { color: "FF8EAADB", text: "BE NOTED, CLEARANCE PENDING" },
          { color: "f4b083", text: "BE NOTED, ARRIVAL PENDING" },
          { color: "ffff66", text: "SEA IGM FILED" },
          { color: "FFFFFFFF", text: "ESTIMATED TIME OF ARRIVAL" },
        ];

        // Loop through the additional table data and add rows to the worksheet
        for (const row of additionalTableData) {
          const additionalTableRow = worksheet.addRow([]);

          // Add an empty cell to the first column
          const firstCell = additionalTableRow.getCell(1);

          // Set background color based on row color
          firstCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: row.color },
          };

          // Add text to the second column
          additionalTableRow.getCell(2).value = row.text;

          // Apply formatting to the entire row
          additionalTableRow.eachCell({ includeEmpty: true }, (cell) => {
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
          });

          // Set row height for the additional table rows
          additionalTableRow.height = 20;
        }

        worksheet.getColumn(2).width = 30;
        worksheet.addRow([]);
        worksheet.addRow([]);

        // Summary Table
        const summaryRow = worksheet.addRow(["SUMMARY", "", "", "", ""]);
        summaryRow.getCell(1).alignment = {
          horizontal: "center",
          vertical: "middle",
        };
        summaryRow.getCell(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "92D050" },
          font: { color: { argb: "FFFFFF" } },
        };

        worksheet.mergeCells(`A${summaryRow.number}:E${summaryRow.number}`); // Merge cells for the "Summary" row

        const countArrivalDateSize20 = matchingJobData.filter((job) =>
          job.container_nos.some(
            (container) => container.size === "20" && container.arrival_date
          )
        ).length;

        const countArrivalDateSize40 = matchingJobData.filter((job) =>
          job.container_nos.some(
            (container) => container.size === "40" && container.arrival_date
          )
        ).length;

        const countNoArrivalDateSize20 = matchingJobData.filter((job) =>
          job.container_nos.some(
            (container) => container.size === "20" && !container.arrival_date
          )
        ).length;

        const countNoArrivalDateSize40 = matchingJobData.filter((job) =>
          job.container_nos.some(
            (container) => container.size === "40" && !container.arrival_date
          )
        ).length;

        const totalCount =
          countArrivalDateSize20 +
          countArrivalDateSize40 +
          countNoArrivalDateSize20 +
          countNoArrivalDateSize40;

        // Add the new table with merged cells
        const newTableData = [
          ["20'", "40'", "20'", "40'", ""],
          [
            countArrivalDateSize20,
            countArrivalDateSize40,
            countNoArrivalDateSize20,
            countNoArrivalDateSize40,
            totalCount,
          ],
        ];

        // Get the starting row number for the new table
        const startRow = summaryRow.number + 1; // Adjusted to remove the extra rows

        // Merge cells and apply formatting
        worksheet.addTable({
          name: "SummaryTable",
          ref: `A${startRow}:E${startRow + newTableData.length - 1}`,
          columns: [
            { name: "ARRIVED" },
            { name: "IN TRANSIT" },
            { name: "TOTAL" },
            { name: "D" },
            { name: "TOTAL" },
          ],
          rows: newTableData,
        });

        for (let row = startRow; row <= startRow + newTableData.length; row++) {
          for (let col = 1; col <= 5; col++) {
            const cell = worksheet.getCell(
              `${String.fromCharCode(64 + col)}${row}`
            );
            cell.alignment = {
              horizontal: "center",
              vertical: "middle",
            };
            cell.font = {
              color: "#000000",
            };
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
          }
        }

        // Merge cells and add text for "Arrived" and "In Transit"
        worksheet.mergeCells(`A${startRow}:B${startRow}`); // Merge cells for the "Arrived" text
        const arrivedCell = worksheet.getCell(`A${startRow}`);
        arrivedCell.value = "ARRIVED";
        arrivedCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "8EAADB" },
        };

        worksheet.mergeCells(`C${startRow}:D${startRow}`); // Merge cells for the "In Transit" text
        const inTransitCell = worksheet.getCell(`C${startRow}`);
        inTransitCell.value = "IN TRANSIT";
        inTransitCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "F4B083" },
        };

        const totalCell = worksheet.getCell(`E${startRow}`);
        totalCell.value = "TOTAL";
        totalCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFF04" },
        };

        const totalCountCell = worksheet.getCell(`E${startRow + 2}`);
        totalCountCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFF04" },
        };

        const lastRow = worksheet.getRow(startRow + newTableData.length);
        for (let col = 1; col <= 2; col++) {
          const cell = lastRow.getCell(col);
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "8EAADB" },
          };
        }

        for (let col = 3; col <= 4; col++) {
          const cell = lastRow.getCell(col);
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "F4B083" },
          };
        }

        const buffer = await workbook.xlsx.writeBuffer();

        // Construct the email content
        const msg = {
          to: "manu@surajforwarders.com",
          from: reportField.senderEmail,
          subject: "Your Excel Report",
          text: "Your Excel Report",
          html: "<p>Your Excel Report</p>",
          attachments: [
            {
              content: buffer.toString("base64"),
              filename: `${worksheetName}.xlsx`,
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // MIME type for Excel files
              disposition: "attachment",
            },
          ],
        };

        if (matchingJobData.length > 0) {
          try {
            await sgMail.send(msg);
            console.log(`Email sent`);
          } catch (error) {
            console.error(
              `Error sending email to ${reportField.email}:`,
              error
            );
          }
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
});

export default router;
