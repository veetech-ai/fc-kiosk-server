"use strict";

const path = require("path");
const fs = require("fs");
const { upload_file } = require("../common/upload");

module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define(
    "Course", // to be used for kiosk
    {
      golfbertId: {
        field: "golfbert_id",
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: true,
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      name: DataTypes.STRING,
      phone: DataTypes.STRING,
      country: DataTypes.STRING,
      street: DataTypes.STRING,
      city: DataTypes.STRING,
      state: DataTypes.STRING,
      zip: DataTypes.STRING,
      lat: DataTypes.DOUBLE,
      long: DataTypes.DOUBLE,
      yards: DataTypes.INTEGER,
      par: DataTypes.INTEGER,
      holes: DataTypes.STRING,
      logo: DataTypes.STRING,
      slope: DataTypes.INTEGER,
      content: DataTypes.TEXT,
      images: DataTypes.JSON,
      year_built: DataTypes.INTEGER,
      architects: DataTypes.STRING,
      greens: DataTypes.STRING,
      fairways: DataTypes.STRING,
      members: DataTypes.STRING,
      season: DataTypes.STRING,
      email: DataTypes.STRING,
      ghin_url: DataTypes.STRING,
      orgId: {
        field: "org_id",
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Organization",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: {
        field: "created_at",
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        field: "updated_at",
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      hooks: {
        afterCreate: async (course) => {
          // TODO: Move this to a service - Refactoring chore
          const builtInTiles = [
            {
              type: "Course Info",
              name: "Course Info",
              builtIn: true,
              fileName: "course_info.png",
            },
            {
              type: "Coupons",
              name: "Coupons",
              builtIn: true,
              fileName: "coupons.png",
            },
            {
              type: "Lessons",
              name: "Lessons",
              builtIn: true,
              fileName: "training.png",
            },
            {
              type: "Memberships",
              name: "Memberships",
              builtIn: true,
              fileName: "membership.png",
            },
            {
              type: "Feedback",
              name: "Feedback",
              builtIn: true,
              fileName: "feedback.png",
            },
            {
              type: "Careers",
              name: "Careers",
              builtIn: true,
              fileName: "careers.png",
            },
            {
              type: "Shop",
              name: "Shop",
              builtIn: true,
              fileName: "shop1.png",
            },
            {
              type: "Statistics",
              name: "Statistics",
              builtIn: true,
              fileName: "stats.png",
            },
            {
              type: "Rent A Cart",
              name: "Rent A Cart",
              builtIn: true,
              fileName: "rent_a_cart.png",
            },
            {
              type: "webApp",
              name: "Ghin App",
              builtIn: true,
              fileName: "GHIN.png",
            },
            {
              type: "Wedding Event",
              name: "Wedding Event",
              builtIn: true,
              fileName: "wedding_icon.png",
            },
            { type: "FAQs", name: "FAQs", builtIn: true, fileName: "faq.png" },
          ];

          const courseTilesData = [];

          for (const tile of builtInTiles) {
            const filePath = path.join(__dirname, "../assets", tile.fileName);
            if (fs.existsSync(filePath)) {
              try {
                const createFormidableFileObject = (filePath) => {
                  const stats = fs.statSync(filePath);
                  return {
                    filepath: filePath, // Where the file is stored (matches formidable)
                    originalFilename: path.basename(filePath), // Original filename
                    size: stats.size, // File size in bytes
                    // Add these to work with your existing upload logic:
                    path: filePath, // Alias for `filepath` (for AWS S3 case)
                    name: path.basename(filePath), // Alias for `originalFilename`
                  };
                };
                const file = createFormidableFileObject(filePath);
                const allowedTypes = ["jpg", "jpeg", "png", "webp"];
                tile.bgImage = await upload_file(
                  file,
                  "uploads/tiles",
                  allowedTypes,
                );
              } catch (error) {
                console.error(`Error uploading file ${filePath}:`, error);
                throw error;
              }
            }
            const createdTile = await sequelize.models.Tile.create(tile);

            const courseTile = {
              tileId: createdTile.id,
              gcId: course.id,
              layoutNumber: 0,
              isPublished: true,
              isSuperTile: false,
              orderNumber: createdTile.id,
            };

            courseTilesData.push(courseTile);
          }

          if (courseTilesData.length) {
            await sequelize.models.Course_Tile.bulkCreate(courseTilesData);
          }
        },
      },
    },
  );
  Course.associate = function (models) {
    // associations can be defined here
    Course.belongsTo(models.Organization, { foreignKey: "org_id" });
    Course.hasMany(models.FAQ, {
      as: "FAQs",
      foreignKey: "gc_id",
    });
    Course.hasMany(models.Feedback, {
      as: "Feedbacks",
      foreignKey: "gc_id",
    });
    Course.hasMany(models.Coach, {
      as: "Coaches",
      foreignKey: "gc_id",
    });
    Course.hasMany(models.Membership, {
      as: "Memberships",
      foreignKey: "gc_id",
    });
    Course.hasMany(models.Contact_Membership, {
      as: "ContactMemberships",
      foreignKey: "gc_id",
    });
    Course.hasMany(models.Shop, {
      as: "Shops",
      foreignKey: "gc_id",
    });
    Course.hasMany(models.Career, {
      as: "Careers",
      foreignKey: "gcId",
    });
    Course.hasMany(models.Ad, {
      as: "Ads",
      foreignKey: "gc_id",
    });
    Course.hasMany(models.Contact_Career, {
      as: "Contact_Careers",
      foreignKey: "gcId",
    });
    Course.hasMany(models.Contact_Coach, {
      as: "ContactCoaches",
      foreignKey: "gc_id",
    });
    Course.hasMany(models.Device, {
      as: "Devices",
      foreignKey: "gc_id",
    });
    Course.hasMany(models.Screen_Config, {
      as: "Screen_Configs",
      foreignKey: "gc_id",
    });
    Course.hasMany(models.Coupon, {
      as: "Course_Coupons",
      foreignKey: "gcId",
    });
    Course.hasMany(models.Waiver, { foreignKey: "gcId" });
    Course.hasMany(models.Event, {
      as: "Events",
      foreignKey: "gcId",
    });
    Course.hasMany(models.Course_Tile, {
      foreignKey: "gcId",
    });
    Course.hasMany(models.Waiver, {
      foreignKey: "gcId",
    });
  };
  return Course;
};
