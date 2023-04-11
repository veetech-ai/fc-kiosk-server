const config = require("./../config/config");
const pdf = require("html-pdf");

exports.generate = (
  html,
  pdf_file_name = `${config.app.title}-generated.pdf`,
  footer_message = "Invoice was created on a computer and is valid without the signature and seal",
  options = false,
) => {
  return new Promise((resolve, reject) => {
    if (!footer_message) {
      footer_message =
        "Invoice was created on a computer and is valid without the signature and seal";
    }
    if (!options) {
      options = {
        format: "A4",
        border: {
          top: "30px",
          right: "50px",
          bottom: "30px",
          left: "50px",
        },
        footer: {
          height: "10mm",
          contents: {
            default: `<div style="color: #444;margin-top:10px">
                        {{page}}</span>/<span>{{pages}}<br>
                        <div style="color: #777777;
                        width: 100%;
                        border-top: 1px solid #AAAAAA;
                        padding: 8px 0 0 0;
                        text-align: center;">
                            ${footer_message}.
                            <br>
                            <span style="font-size:9px"><i>${global_app_config.label_print_company_website}</i></span>
                        </div>
                    </div>`,
          },
        },
      };
    }
    pdf.create(html, options).toFile(pdf_file_name, function (err, result) {
      if (err) {
        reject({ message: err });
      } else {
        resolve(result);

        // var file = fs.readFileSync(pdf_file_name);
        // email.default({
        //     to: device.Owner.email,
        //     body: `attachement`,
        //     subject: `${config.app.title} - Device Billing Expire Alert`,
        //     attachment: {data: file, filename: `invoice-${device.next_bill_date}.pdf`}
        // });
      }
    });
  });
};
// "footer": {
//     "height": "28mm",
//     "contents": {
//       first: 'Cover page',
//       2: 'Second page', // Any page number is working. 1-based index
//       default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
//       last: 'Last Page'
//     }
//   },
