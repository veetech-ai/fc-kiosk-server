const RemoveDataQueryModel = require("../../../services/remove-data");

describe("Testing the remove-data query functions", () => {
  it("Checks against not found barcode", async () => {
    try {
      await RemoveDataQueryModel.deleteSingleBarcode("");
    } catch (error) {
      expect(error.message).toBe(
        "error in deleting from influx. aborting delete",
      );
    }
  });
});
