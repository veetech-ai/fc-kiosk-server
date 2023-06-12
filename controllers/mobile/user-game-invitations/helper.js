const ServiceError = require("../../../utils/serviceError");

exports.validationsForUpdateStatus = (
  invitationId,
  statusForSingleInvitation,
  invitationIds,
  statusForMultipleInvitations,
) => {
  if (invitationId && !statusForSingleInvitation) {
    throw new ServiceError(
      "Please provide the valid status for the specified invitation id",
      400,
    );
  }
  if (statusForSingleInvitation && !invitationId) {
    throw new ServiceError("Missing invitation id", 400);
  }
  if (invitationIds.length > 0 && !statusForMultipleInvitations) {
    throw new ServiceError(
      "Please provide the valid status for the specified invitation ids",
      400,
    );
  }
};
