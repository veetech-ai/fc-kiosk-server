const helper = require("../../../common/helper");

describe("Test caseses to test the logic of helper functions", () => {
  describe("Test cases for flatten object function", () => {
    it("Should convert the javascript object into flatten object function", () => {
      const testObject = {
        key_value_map: {
          CreatedDate: "123424",
          Department: {
            Name: "XYZ",
          },
        },
      };
      const expectedObject = {
        "key_value_map.CreatedDate": "123424",
        "key_value_map.Department.Name": "XYZ",
      };
      expect(helper.flattenObject(testObject)).toEqual(expectedObject);
    });

    it("Should handle top level along with deep level flatting", () => {
      const testObject = {
        key_value_map: {
          CreatedDate: "123424",
          Department: {
            Name: "XYZ",
          },
        },
        toplevel: "test",
      };
      const expectedObject = {
        toplevel: "test",
        "key_value_map.CreatedDate": "123424",
        "key_value_map.Department.Name": "XYZ",
      };
      expect(helper.flattenObject(testObject)).toEqual(expectedObject);
    });
  });

  describe("Test cases for isURL function", () => {
    it("Should return if valid URL string passes as params in the function", () => {
      expect(helper.isURL("https://www.google.com")).toBe(true);
    });

    it("Should return false invalid URL passes as params in the function", () => {
      expect(helper.isURL("testString")).toBe(false);
    });
  });

  describe("Test cases for objectValuesToNumber function", () => {
    it("returns an empty object when called without any arguments", () => {
      const expectedResult = {};

      expect(helper.objectValuesToNumber()).toEqual(expectedResult);
    });

    it("converts the requested keys to numbers", () => {
      const originalObject = {
        a: 23,
        b: "20",
        c: false,
        d: "25",
      };
      const expectedObject = {
        a: 23,
        b: 20,
        c: 0,
        d: "25",
      };

      const result = helper.objectValuesToNumber(originalObject, [
        "a",
        "b",
        "c",
      ]);

      expect(result).toStrictEqual(expectedObject);
    });

    it("only converts provided keys with boolean values when convertOnlyBoolean is set to true and keys are provided", () => {
      const originalObject = {
        a: 23,
        b: "20",
        c: false,
      };
      const expectedObject = {
        a: 23,
        b: "20",
        c: 0,
      };
      const result = helper.objectValuesToNumber(
        originalObject,
        ["b", "c"],
        true,
      );

      expect(result).toStrictEqual(expectedObject);
    });

    it("only converts all boolean values to number when convertOnlyBoolean is set to true an no values are provided", () => {
      const originalObject = {
        a: true,
        b: "20",
        c: false,
        d: 20,
        e: null,
      };
      const expectedObject = {
        a: 1,
        b: "20",
        c: 0,
        d: 20,
        e: null,
      };
      const result = helper.objectValuesToNumber(originalObject, [], true);

      expect(result).toStrictEqual(expectedObject);
    });

    it("returns the passed object as is if the key is not found in the object", () => {
      const originalObject = {
        a: true,
        b: "20",
      };

      const result = helper.objectValuesToNumber(originalObject, ["e"]);

      expect(result).toStrictEqual(originalObject);
    });
  });

  describe("Test cases for objectValuesToString function", () => {
    let inputObject;

    beforeEach(() => {
      inputObject = {
        a: 123,
        b: 456,
        c: {
          innerA: 789,
        },
      };
    });

    it("should convert all values to strings", () => {
      const convertedObject = helper.objectValuesToString(inputObject);
      const expectedResponse = {
        a: "123",
        b: "456",
        c: '{"innerA":789}',
      };
      expect(convertedObject).toStrictEqual(expectedResponse);
    });

    it("should accept an array of keys and only convert those keys", () => {
      const convertedObject = helper.objectValuesToString(inputObject, ["b"]);
      const expectedResponse = {
        a: 123,
        b: "456",
        c: {
          innerA: 789,
        },
      };
      expect(convertedObject).toStrictEqual(expectedResponse);
    });
  });
});
