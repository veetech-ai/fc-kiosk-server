"use strict";

const { Op } = require("sequelize");
const { Course, Waiver } = require("./../models");

// Function to generate HTML content
function generateHtmlContent() {
  const content = `<h1>Direct Fairways Cart Rental Waiver Agreement</h1>

    <p>
        This Cart Rental Waiver Agreement is entered into between Direct Fairways and the undersigned customer. This Agreement governs the rental of golf carts from the Company.
    </p>

    <h2>Terms and Conditions</h2>

    <p>
        1. <strong>Assumption of Risk:</strong> Customer acknowledges and understands that the use of a golf cart involves inherent risks, including but not limited to accidents, injuries, and property damage. Customer voluntarily assumes all such risks associated with the use of the golf cart.
    </p>

    <p>
        2. <strong>Responsibility:</strong> Customer agrees to operate the golf cart responsibly and in accordance with all applicable laws and regulations. Customer is responsible for any damage or loss of the golf cart during the rental period.
    </p>

    <p>
        3. <strong>Release and Waiver:</strong> Customer releases and waives any claims against Direct Fairways, its employees, and agents, for any injuries, accidents, or damages that may arise from the use of the golf cart, except in cases of gross negligence or willful misconduct.
    </p>

    <p>
        4. <strong>Insurance:</strong> Customer is encouraged to have insurance coverage that may provide protection for any potential liabilities arising from the use of the golf cart.
    </p>

    <p>
        5. <strong>Indemnification:</strong> Customer agrees to indemnify and hold harmless Direct Fairways, its employees, and agents, from and against any claims, demands, losses, liabilities, and expenses (including attorney's fees) arising out of or in connection with the use of the golf cart.
    </p>

    <p>
        6. <strong>Condition of Golf Cart:</strong> Customer acknowledges that the golf cart is in good working condition at the time of rental. Any issues with the golf cart should be reported to Company immediately.
    </p>

    <p>
        7. <strong>Rental Period:</strong> The rental period begins on the date of rental and ends on the agreed-upon return date and time. Late returns may incur additional charges.
    </p>

    <h2>Agreement Acknowledgment</h2>

    <p>
        By accepting and renting the golf cart, Customer acknowledges that they have read and understand the terms and conditions of this Agreement. Customer agrees to comply with all the terms and conditions set forth herein.
    </p>

    <p>
        This Agreement is effective as of the date of the Customer's signature.
    </p>`;

  return content.replace(/(?<=>)\s+(?=<)/g, "");
}

const createdWaiverIds = [];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up() {
    try {
      const courses = await Course.findAll();

      // Seed HTML content for each course
      for (const course of courses) {
        const gcId = course.id;

        // Check if a waiver already exists for this gcId
        const existingWaiver = await Waiver.findOne({
          where: { gcId },
        });

        if (!existingWaiver) {
          const htmlContent = generateHtmlContent();
          const wv = await Waiver.create({
            gcId,
            content: htmlContent,
            name: "Cart Rental Agreement",
          });

          createdWaiverIds.push(wv.id);
          console.log(`Waiver created for ${gcId}`);
        } else {
          console.log(`Waiver already exists for ${gcId}. Skipping.`);
        }
      }
    } catch (err) {
      console.log(err);
    }
  },

  async down() {
    await Waiver.destroy({ where: { id: { [Op.in]: createdWaiverIds } } });
  },
};
