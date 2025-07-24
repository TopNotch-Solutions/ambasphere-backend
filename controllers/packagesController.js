const Packages = require("../models/Packages");
const sequelize = require("../config/database");
const logger = require("../middlewares/errorLogger");

exports.createPackage = async (req, res) => {
  try{
    const {
      PackageName,
      PaymentPeriod,
      MonthlyPrice,
    } = req.body;

    const newPackage = await Packages.create({
      PackageName,
      PaymentPeriod,
      MonthlyPrice,
    });

    res.status(200).json(newPackage);
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      message: "Failed to create package:",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
  
}

exports.getPackages = async (req, res) => {
  try {
    const packages = await Packages.findAll();
    res.status(200).json(packages);
  } catch (error) {
    console.log("Here is the error:", error)
    logger.error(error);
    res.status(500).json({
      message: "Failed to retrieve package details:",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

exports.updatePackage = async (req, res) => {
  const { id } = req.params;
  let { PackageName, PaymentPeriod, MonthlyPrice } = req.body;

  if (!PackageName || !PaymentPeriod || !MonthlyPrice) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // ✅ Remove " months" and convert to number
    if (typeof PaymentPeriod === "string") {
      PaymentPeriod = PaymentPeriod.replace(/\s*months?/i, ""); // remove " months" or "month"
    }

    const existingPackage = await Packages.findOne({ where: { PackageID: id } });

    if (!existingPackage) {
      return res.status(404).json({ message: `Package with ID ${id} not found.` });
    }

    await Packages.update(
      {
        PackageName,
        PaymentPeriod: parseInt(PaymentPeriod), // now numeric
        MonthlyPrice: parseFloat(MonthlyPrice),
      },
      {
        where: { PackageID: id },
      }
    );

    return res.status(200).json({ message: `Package ${id} has been updated.` });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      message: "Failed to update package.",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};



exports.removePackage = async (req, res) => {
  try {
    const { PackageID } = req.params;

    // Ensure PackageID is provided
    if (!PackageID) {
      return res.status(400).json({
        message: "PackageID is required.",
      });
    }

    // Attempt to find and delete the package by PackageID
    const deletedPackage = await Packages.destroy({
      where: {
        PackageID: PackageID,
      },
    });

    if (deletedPackage) {
      res.status(200).json({
        message: `Package with ID ${PackageID} has been deleted.`,
      });
    } else {
      res.status(404).json({
        message: `Package with ID ${PackageID} not found.`,
      });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      message: "Failed to delete package.",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
}

exports.getPackageList = async (req, res) => {
  try {
    const staffPackages = await sequelize.query(
      `SELECT PackageID, PackageName, MonthlyPrice FROM packages`,
      { type: sequelize.QueryTypes.SELECT }
    );
    res.status(200).json(staffPackages);
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      message: "Failed to retrieve package list:",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

exports.getPackageById = async (req, res) => {
  try {
    const package = await Packages.findByPk(req.params.id);
    if (!package) {
      return res.status(404).json({ message: "Package not found" });
    }
    res.json(package);
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      message: "Failed to retrieve package by employee code:",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  } 
};


