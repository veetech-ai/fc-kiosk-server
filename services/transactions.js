const models = require("../models");
const UserModel = require("../services/user");
const Transactions = models.Transactions;
const Sequelize = require("sequelize");
const op = Sequelize.Op;

const { logger } = require("../logger");

const percentageFormula = (number, total) => {
  number = parseInt(number);
  total = parseInt(total);
  return parseFloat(parseFloat((number / total) * 100).toFixed(1));
};

exports.save = async (params) => {
  const { session_id, device_id } = params;
  const find = await Transactions.findOne({
    attributes: ["id"],
    where: { session_id },
  });

  if (!find)
    return await Transactions.create({
      session_id,
      device_id,
    });

  return await Transactions.update(params.data, { where: { session_id } });
};

exports.getMetrics = async ({ organizationId = null, device_id = null }) => {
  const where = {};
  if (organizationId) {
    where.owner_id = organizationId;
  }

  if (device_id) {
    where.id = device_id;
  }

  let [
    successful,
    total,
    cancelled,
    timeout,
    new_sim,
    duplicate_sim,
    packages,
    feedback_score,
    rejected,
    failed,
    pending,
    english,
    urdu,
    list,
    advance,
    post,
    pre,
  ] = Array(17).fill(0);
  let [
    total_feedback_score,
    feedbackCount,
    avg_screen_time,
    total_approval_time_difference,
    count,
    avg_approval_time,
    total_screen_time,
  ] = Array(7).fill(0);

  let pakistani = 0;
  let foreigners = 0;
  const passport = { approved: 0, rejected: 0, total: 0, pending: 0 };

  const logs = await Transactions.findAll({
    raw: true,
    attributes: [
      "approvalDecisionAt",
      "endedAt",
      "service",
      "status",
      "fault",
      "feedback",
      "time_spent",
      "language",
      "number_selection",
      "billing",
      "passport_number",
      "foreign_transaction_status",
    ],
    include: [
      {
        as: "Device",
        model: models.Device,
        required: true,
        attributes: ["id"],
        where,
      },
    ],
  });
  total = logs.length;
  for (const log of logs) {
    if (log.status === "pending") pending += 1;
    if (log.status === "failed") failed += 1;
    if (log.status === "rejected") rejected += 1;
    if (log.status === "cancelled") cancelled += 1;
    if (log.status === "timeout") timeout += 1;
    if (log.status === "success") {
      successful += 1;

      if (log.time_spent) {
        total_screen_time = total_screen_time + log.time_spent;
      }
    }

    if (log.status === "success" && log.service === "new_sim") new_sim += 1;
    if (log.status === "success" && log.service === "duplicate_sim")
      duplicate_sim += 1;
    if (log.status === "success" && log.service === "package") packages += 1;

    if (log.status === "success" && log.feedback) {
      feedbackCount += 1;
    }

    if (log.status === "success" && log.feedback) {
      total_feedback_score += log.feedback;
    }
    if (log.language === "English") english += 1;
    if (log.language === "Urdu") urdu += 1;

    if (log.number_selection === "advance") advance += 1;
    if (log.number_selection === "list") list += 1;

    if (log.billing === "postpaid") post += 1;
    if (log.billing === "prepaid") pre += 1;

    if (log.passport_number) {
      if (
        log.foreign_transaction_status &&
        log.approvalDecisionAt &&
        log.endedAt
      ) {
        count = count + 1;
        total_approval_time_difference =
          total_approval_time_difference +
          (log.approvalDecisionAt - log.endedAt) / 60000;
      }
      if (log.foreign_transaction_status == 1) {
        passport.approved += 1;
      }
      if (log.foreign_transaction_status == 2) {
        passport.rejected += 1;
      }
      if (log.foreign_transaction_status === null && log.status === "success") {
        passport.pending += 1;
      }
      foreigners += 1;
    } else {
      pakistani += 1;
    }
  }
  if (count > 0) {
    avg_approval_time = (total_approval_time_difference / count).toFixed(1);
  }
  count = 0;
  total_approval_time_difference = 0;
  passport.total = passport.approved + passport.rejected + passport.pending;

  if (feedbackCount) {
    feedback_score = (total_feedback_score / feedbackCount).toFixed(1);
  }

  if (successful) {
    avg_screen_time = (total_screen_time / successful).toFixed(1); // seconds
  }

  const sims_dispensed = duplicate_sim + new_sim;
  return {
    total,
    successful,
    failed,
    rejected,
    pending,
    cancelled,
    timeout,
    new_sim,
    duplicate_sim,
    packages,
    sims_dispensed,
    feedback_score,
    avg_screen_time,
    english,
    urdu,
    advance,
    list,
    pre,
    post,
    passport,
    avg_approval_time,
    foreigners,
    pakistani,
  };
};

exports.list = async ({
  organizationId = false,
  filters = null,
  pp = null,
  passport_only = false,
  columns = false,
}) => {
  const where = {};
  if (filters) {
    if (filters.device_id) {
      where.device_id = filters.device_id;
    }

    if (filters.service) {
      where.service = filters.service;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.cnic) {
      where.cnic = filters.cnic;
    }

    if (filters.passport_number) {
      where.passport_number = filters.passport_number;
    }

    if (filters.mobile_number) {
      where.mobile_number = filters.mobile_number;
    }
    if (
      filters.foreign_transaction_status !== undefined &&
      (filters.foreign_transaction_status == "null" ||
        filters.foreign_transaction_status == null ||
        filters.foreign_transaction_status == 1 ||
        filters.foreign_transaction_status == 2)
    ) {
      if (filters.foreign_transaction_status == "null") {
        filters.foreign_transaction_status = null;
      }
      where.foreign_transaction_status = filters.foreign_transaction_status;
    }
  }

  if (passport_only) {
    where.passport_number = { [op.ne]: null };
  }

  if (!columns) {
    columns = [
      "id",
      "session_id",
      "decidedBy",
      "service",
      "status",
      "fault",
      "feedback",
      "time_spent",
      "cnic",
      "mobile_number",
      "createdAt",
      "screen_number",
      "IMSI",
      "language",
      "package_name",
      "number_selection",
      "sim_accepted",
      "billing",
      "passport_number",
      "foreign_transaction_status",
    ];
  }
  const transactionsWhere = {};
  if (organizationId) {
    transactionsWhere.owner_id = organizationId;
  }
  const query = {
    raw: true,
    attributes: columns,
    where,
    include: [
      {
        as: "Device",
        model: models.Device,
        required: true,
        attributes: ["id"],
        where: transactionsWhere,
      },
    ],
    order: [["id", "DESC"]],
  };

  if (pp) {
    query.limit = pp.limit || 10;
    query.offset = pp.offset || 0;
  }

  const data = await Transactions.findAll(query);
  if (passport_only) {
    await this.addDecidedByNameToTransactions(data);
  }
  const count = await Transactions.count(query);

  return { data, count };
};

exports.addDecidedByNameToTransactions = async (data) => {
  let ids = [...new Set(data.map((approval) => approval.decidedBy))];
  logger.info(ids);

  let users = null;
  ids = ids.filter((id) => id != null);

  if (ids.length <= 0) return;

  users = await UserModel.list_selective_users(0, 0, ids);

  data.forEach((approval) => {
    if (approval.decidedBy) {
      const user = users.filter((user) => user.id == approval.decidedBy)[0];
      approval.decidedByName = user ? user.name : null;
    } else {
      approval.decidedByName = null;
    }
  });
};

exports.getFeedbackData = async ({ user_id, device_id = null }) => {
  if (!user_id) {
    throw new Error("user_id not provided");
  }

  const where = { owner_id: user_id };
  if (device_id) {
    where.id = device_id;
  }

  const feedback = await Transactions.findAll({
    raw: true,
    attributes: [
      "feedback",
      [Sequelize.fn("COUNT", "Transactions.id"), "feedbackCount"],
    ],
    group: ["feedback"],
    include: [
      {
        as: "Device",
        model: models.Device,
        required: true,
        attributes: ["id"],
        where,
      },
    ],
  });

  let total = 0;
  for (const fb of feedback) {
    if (fb.feedback) {
      total += fb.feedbackCount;
    }
  }

  const feedbackData = {
    happy: 0,
    smile: 0,
    neutral: 0,
    sad: 0,
    very_sad: 0,
  };

  for (const fb of feedback) {
    if (fb.feedback) {
      if (fb.feedback == 1) {
        feedbackData.very_sad = percentageFormula(fb.feedbackCount, total);
      }
      if (fb.feedback == 2) {
        feedbackData.sad = percentageFormula(fb.feedbackCount, total);
      }
      if (fb.feedback == 3) {
        feedbackData.neutral = percentageFormula(fb.feedbackCount, total);
      }
      if (fb.feedback == 4) {
        feedbackData.smile = percentageFormula(fb.feedbackCount, total);
      }
      if (fb.feedback == 5) {
        feedbackData.happy = percentageFormula(fb.feedbackCount, total);
      }
    }
  }

  return feedbackData;
};

exports.getById = async ({ id }) => {
  if (!id) throw new Error("id not provided");

  const data = await Transactions.findOne({
    where: { session_id: id },
  });

  if (!data) throw new Error("transaction not found");
  if (!data.decidedBy) return data;

  try {
    const user = await UserModel.findById(data.decidedBy);

    data.setDataValue("decidedByName", user.name);

    return data;
  } catch (error) {
    logger.error(error.message);

    data.setDataValue("decidedByName", null);

    return data;
  }
};

exports.updateStatusById = async ({
  sessionId,
  status,
  approvalDecision,
  decisionMadeBy,
  orgId = null,
}) => {
  if (!sessionId) throw new Error("session id not provided");
  if (!status) throw new Error("status not provided");
  if (!approvalDecision) throw new Error("approval time not provided");
  if (!decisionMadeBy) throw new Error("admin id not provided");

  const query = {
    include: [
      {
        as: "Device",
        model: models.Device,
        attributes: ["id", "owner_id"],
      },
    ],
    where: {
      session_id: sessionId,
    },
  };

  const transaction = await Transactions.findOne(query);
  if (!transaction) throw new Error("transaction not found");

  if (!transaction.passport_number || transaction.status !== "success")
    throw new Error("noForeignTransaction");

  if (orgId && transaction.Device.owner_id !== orgId)
    throw new Error("notAllowed");

  if (!(orgId && transaction.Device.owner_id === orgId) && orgId != null)
    return;

  const result = await Transactions.update(
    {
      foreign_transaction_status: status,
      approvalDecisionAt: approvalDecision,
      decidedBy: decisionMadeBy,
    },
    {
      where: { session_id: sessionId },
    },
  );

  if (!result) throw new Error("There is a problem. Please try later.");
  return result;
};
