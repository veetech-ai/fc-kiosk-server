exports.generateWaiverHtmlContent = () => {
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

    <h2>Agreement Acknowledgment</h2>

    <p>
        By accepting and renting the golf cart, Customer acknowledges that they have read and understand the terms and conditions of this Agreement. Customer agrees to comply with all the terms and conditions set forth herein.
    </p>

    <p>
        This Agreement is effective as of the date of the Customer's signature.
    </p>`;

  return content.replace(/(?<=>)\s+(?=<)/g, "");
};
