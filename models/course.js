"use strict";

const path = require("path");
const fs = require("fs");
const config = require("../config/config");
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
      defaultSuperTileImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
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
              superTileImageName: "course-info-supertile.jpeg",
            },
            {
              type: "Coupons",
              name: "Coupons",
              builtIn: true,
              fileName: "coupons.png",
              superTileImageName: "coupons-supertile.webp",
            },
            {
              type: "Lessons",
              name: "Lessons",
              builtIn: true,
              fileName: "training.png",
              superTileImageName: "lessons-supertile.webp",
            },
            {
              type: "Memberships",
              name: "Memberships",
              builtIn: true,
              fileName: "membership.png",
              superTileImageName: "memberships-supertile.jpeg",
            },
            {
              type: "Feedback",
              name: "Feedback",
              builtIn: true,
              fileName: "feedback.png",
              superTileImageName: "feedback-supertile.jpeg",
            },
            {
              type: "Careers",
              name: "Careers",
              builtIn: true,
              fileName: "careers.png",
              superTileImageName: "careers-supertile.jpeg",
            },
            {
              type: "Shop",
              name: "Shop",
              builtIn: true,
              fileName: "shop1.png",
              superTileImageName: "shop-supertile.jpeg",
            },
            {
              type: "Statistics",
              name: "Statistics",
              builtIn: true,
              fileName: "stats.png",
              superTileImageName: "stats-supertile.jpeg",
            },
            {
              type: "Rent A Cart",
              name: "Rent A Cart",
              builtIn: true,
              fileName: "rent_a_cart.png",
              superTileImageName: "rent-a-cart-supertile.jpg",
            },
            {
              type: "webApp",
              name: "Ghin App",
              url: course.ghin_url,
              builtIn: true,
              fileName: "GHIN.png",
              superTileImageName: "GHIN.png",
            },
            {
              type: "Wedding Event",
              name: "Wedding Event",
              builtIn: true,
              fileName: "wedding_icon.png",
              superTileImageName: "wedding-event-supertile.jpeg",
            },
            {
              type: "FAQs",
              name: "FAQs",
              builtIn: true,
              fileName: "faq.png",
              superTileImageName: "faqs-supertile.jpeg",
            },
          ];

          const courseTilesData = [];
          const { createFormidableFileObject } = require("../common/helper");

          const uploadPromises = builtInTiles.map(async (tile) => {
            const filePath = path.join(__dirname, "../assets", tile.fileName);
            const superTileFilePath = path.join(
              __dirname,
              "../assets",
              tile.superTileImageName,
            );

            try {
              if (fs.existsSync(filePath) || fs.existsSync(superTileFilePath)) {
                const file = createFormidableFileObject(filePath);
                const superTileFile =
                  createFormidableFileObject(superTileFilePath);
                const allowedTypes = ["jpg", "jpeg", "png", "webp"];
                // do not upload images in test environment
                if (config.env !== "test") {
                  if (file)
                    tile.bgImage = await upload_file(
                      file,
                      "uploads/tiles",
                      allowedTypes,
                    );

                  if (superTileFile)
                    tile.superTileImage = await upload_file(
                      superTileFile,
                      "uploads/tiles",
                      allowedTypes,
                    );
                }
              }
            } catch (error) {
              console.error(`Error uploading file:`, error);
              throw error;
            }

            const createdTile = await sequelize.models.Tile.create(tile);

            const courseTile = {
              tileId: createdTile.id,
              gcId: course.id,
              layoutNumber: 0,
              isPublished: true,
              isSuperTile: false,
              orderNumber: builtInTiles.indexOf(tile) + 1,
            };

            courseTilesData.push(courseTile);
          });

          await Promise.all(uploadPromises);

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
