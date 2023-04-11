module.exports = {
  getUpdateWhereMockImplementations(implementationType) {
    let implementationToReturn;
    switch (implementationType) {
      case "data-updated-successfully":
        implementationToReturn = () => Promise.resolve([1]); // one record updated
        break;
      case "data-already-up-to-date":
        implementationToReturn = () => Promise.resolve([0]); // no record updated
        break;
      case "error-during-update":
        implementationToReturn = () => Promise.reject({ message: "" }); // error
        break;
    }
    return implementationToReturn;
  },

  getFindByIdMockImplementations(implementationType) {
    let implementationToReturn;
    switch (implementationType) {
      case "success":
        implementationToReturn = (id) => Promise.resolve({ id });
        break;
      case "failure":
        implementationToReturn = (id) => Promise.resolve(null);
        break;
      case "error":
        implementationToReturn = (id) => Promise.reject({ message: "" });
        break;
    }
    return implementationToReturn;
  },

  getAttachRemoteMockImplementations(implementationType) {
    let implementationToReturn;
    switch (implementationType) {
      case "success":
        implementationToReturn = () => Promise.resolve([1]); // one record updated
        break;
      case "failure":
        implementationToReturn = () => Promise.resolve([0]); // no record updated
        break;
      case "error":
        implementationToReturn = () => Promise.reject({ message: "" }); // error
        break;
    }
    return implementationToReturn;
  },
};
