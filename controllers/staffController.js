const Staff = require("../models/Staff");
const sequelize = require("../config/database");
const logger = require("../middlewares/errorLogger");
const TempData = require("../models/TempData");
const { Op } = require("sequelize");

// Create Employee
exports.createStaff = async (req, res) => {
  try {
    const {
      EmployeeCode,
      RoleID,
      AllocationID,
      FirstName,
      LastName,
      FullName,
      Email,
      PhoneNumber,
      Gender,
      ServicePlan,
      Position,
      Department,
      Division,
      EmploymentCategory,
      EmploymentStatus,
    } = req.body;

    // Create a new contract
    const newEmployee = await Staff.create({
      EmployeeCode,
      RoleID,
      AllocationID,
      FirstName,
      LastName,
      FullName,
      Email,
      PhoneNumber,
      Gender,
      ServicePlan,
      Position,
      Department,
      Division,
      EmploymentCategory,
      EmploymentStatus,
    });

    res.status(200);
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      message: "Failed to create staff member:",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

// Get all Active Employees
exports.getStaff = async (req, res) => {
  try {
    const staff = await Staff.findAll({
      where: {
        EmploymentStatus: "Active",
      },
    });
    res.json(staff);
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      message: "Failed to retrieve staff details:",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

exports.getNewStaff = async (req, res) => {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const staff = await Staff.findAll({
      where: {
        EmploymentStatus: "Active",
        EmploymentStartDate: {
          [Op.gt]: oneYearAgo,
        },
      },
    });
    res.json(staff);
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      message: "Failed to retrieve staff details:",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

exports.getRetiredStaff = async (req, res) => {
  try {
    const staff = await Staff.findAll({
      where: {
        EmploymentCategory: "Retired",
      },
    });
    res.json(staff);
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      message: "Failed to retrieve new staff details:",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

// Get all Employees Including Inactive
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.findAll();
    res.json(staff);
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      message: "Failed to retrieve staff details:",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

exports.getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }
    res.json(staff);
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      message: "Failed to retrieve staff details by id:",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

// Update Employee Phone Number
exports.updateStaff = async (req, res) => {
  const { employeeCode } = req.params;
  const updateFields = req.body;

  try {
    // Find the staff member by EmployeeCode
    const staffMember = await Staff.findOne({
      where: { EmployeeCode: employeeCode },
    });

    if (!staffMember) {
      return res.status(404).json({ message: "Staff member not found." });
    }

    // Update only the fields present in the request body
    await staffMember.update(updateFields, {
      fields: [
        "LastName",
        "PhoneNumber",
        "ServicePlan",
        "Position",
        "Division",
        "EmploymentCategory",
        "EmploymentStatus",
        "Department",
      ],
    });

    // Respond with success
    res.status(200).json({ message: "Staff member updated successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while updating the staff member." });
  }
};

// Remove Employees
exports.setInactive = async (req, res) => {
  try {
    const employeeCode = req.params.employeeCode;

    const [results, metadata] = await sequelize.query(
      `UPDATE employees
      SET EmploymentStatus = 'inactive'
      WHERE EmployeeCode = :employeeCode`,
      {
        replacements: { employeeCode },
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    if (metadata.affectedRows === 0) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    res
      .status(200)
      .json({ message: "Staff member status updated to inactive" });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      message: "Failed to update staff member status:",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};


// Get Count of Employee Count
exports.getStaffCount = async (req, res) => {
  try {
    const employees = await Staff.count();
    res.json({ count: employees });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      message: "Failed to retrieve permanent staff details:",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

// Get Count of Permanent Staff
exports.getPermanentStaff = async (req, res) => {
  try {
    const permanentEmployees = await Staff.count({
      where: {
        EmploymentCategory: "Permanent",
      },
    });
    res.json({ count: permanentEmployees });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      message: "Failed to retrieve permanent staff details:",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

// Get Count of Temporary Staff
exports.getTemporaryStaff = async (req, res) => {
  try {
    const temporaryEmployees = await Staff.count({
      where: {
        EmploymentCategory: "Temporary",
      },
    });
    res.json({ count: temporaryEmployees });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      message: "Failed to retrieve temporary staff details:",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

// Get Count of Active Staff
exports.getActiveStaff = async (req, res) => {
  try {
    const activeEmployees = await Staff.count({
      where: {
        EmploymentStatus: "Active",
      },
    });
    res.json({ count: activeEmployees });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      message: "Failed to retrieve active staff details:",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

// Get Count of Inactive Staff
exports.getInactiveStaff = async (req, res) => {
  try {
    const inactiveEmployees = await Staff.count({
      where: {
        EmploymentStatus: "Inactive",
      },
    });
    res.json({ count: inactiveEmployees });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      message: "Failed to retrieve inactive staff details:",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

// Get Count of Male Staff
exports.getMaleStaff = async (req, res) => {
  try {
    const maleEmployees = await Staff.count({
      where: {
        Gender: "Male",
        EmploymentStatus: "Active",
      },
    });
    res.json({ count: maleEmployees });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      message: "Failed to retrieve male staff details:",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

// Get Count of Female Staff
exports.getFemaleStaff = async (req, res) => {
  try {
    const femaleEmployees = await Staff.count({
      where: {
        Gender: "Female",
        EmploymentStatus: "Active",
      },
    });
    res.json({ count: femaleEmployees });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      message: "Failed to retrieve female staff details:",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

// Get Count of PostPaid Staff
exports.getPostPaidStaff = async (req, res) => {
  try {
    const postPaidEmployees = await Staff.count({
      where: {
        ServicePlan: "Postpaid",
        EmploymentStatus: "Active",
      },
    });
    res.json({ count: postPaidEmployees });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      message: "Failed to retrieve postpaid staff details:",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

// Get Count of PrePaid Staff
exports.getPrePaidStaff = async (req, res) => {
  try {
    const prePaidEmployees = await Staff.count({
      where: {
        ServicePlan: "Prepaid",
        EmploymentStatus: "Active",
      },
    });
    res.json({ count: prePaidEmployees });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      message: "Failed to retrieve prepaid staff details:",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

// Get Admin Role Staff
exports.getAdmin = async (req, res) => {
  try {
    const adminStaff = await sequelize.query(
      `SELECT e.FullName, e.Email, e.EmployeeCode, r.RoleName, r.RoleID
      FROM employees e 
      INNER JOIN roles r ON e.RoleID = r.RoleID
      WHERE r.RoleName = 'Admin'
      WHERE e.EmploymentStatus = 'Active',`,
      { type: sequelize.QueryTypes.SELECT }
    );
    res.status(200).json(adminStaff);
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      message: "Failed to retrieve admin staff details:",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};
exports.getStaffWithAirtimeAllocationUser = async (req, res) => {
  try {
    const employeeCode = req.params.id;

    const query = `SELECT e.EmployeeCode, e.AllocationID, e.FullName,  e.PhoneNumber, e.ServicePlan, a.AirtimeAllocation
      FROM employees e 
      INNER JOIN allocation a ON e.AllocationID = a.AllocationID
      WHERE e.EmployeeCode = :employeeCode
      AND e.EmploymentStatus = 'Active';`;

    const staffWithAirtimeAllocation = await sequelize.query(query, {
      replacements: { employeeCode },
      type: sequelize.QueryTypes.SELECT,
    });
    
    res.status(200).json({staffWithAirtimeAllocation});
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      message: "Failed to retrieve staff details with airtime details :",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

// Get Staff with Airtime Allocation
exports.getStaffWithAirtimeAllocation = async (req, res) => {
  try {
    const employeeCode = req.params.id;

    const query = `SELECT e.EmployeeCode, e.AllocationID, e.FullName,  e.PhoneNumber, e.ServicePlan, a.AirtimeAllocation
      FROM employees e 
      INNER JOIN allocation a ON e.AllocationID = a.AllocationID
      WHERE e.EmployeeCode = :employeeCode
      AND e.EmploymentStatus = 'Active';`;

    const staffWithAirtimeAllocation = await sequelize.query(query, {
      replacements: { employeeCode },
      type: sequelize.QueryTypes.SELECT,
    });
    const staff = await Staff.findOne({ where: { EmployeeCode: employeeCode } });

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    const [allocationResult] = await sequelize.query(
      `SELECT AirtimeAllocation FROM allocation WHERE AllocationID = ? LIMIT 1`,
      { replacements: [staff.AllocationID] }
    );

    const allocation = allocationResult[0];
    console.log("My allocations: ",allocation)
    if (!allocation) {
      return res.status(404).json({ message: "Allocation not found" });
    }

    const query2 = `SELECT c.*, p.PackageName, e.FullName, a.AirtimeAllocation
          FROM contracts c
          INNER JOIN employees e ON c.EmployeeCode = e.EmployeeCode
          INNER JOIN packages p ON c.PackageID = p.PackageID
          INNER JOIN allocation a ON e.AllocationID = a.AllocationID
          WHERE e.EmployeeCode = :employeeCode
          AND c.SubscriptionStatus != 'Expired'
          AND e.EmploymentStatus = 'Active'`;
    
        const contracts = await sequelize.query(query2, {
          replacements: { employeeCode },
          type: sequelize.QueryTypes.SELECT,
        });
        const query3 = `SELECT c.*, p.PackageName, e.FullName, a.AirtimeAllocation
          FROM contracts c
          INNER JOIN employees e ON c.EmployeeCode = e.EmployeeCode
          INNER JOIN packages p ON c.PackageID = p.PackageID
          INNER JOIN allocation a ON e.AllocationID = a.AllocationID
          WHERE e.EmployeeCode = :employeeCode
          AND e.EmploymentStatus = 'Active'`;
    
        const contracts3 = await sequelize.query(query2, {
          replacements: { employeeCode },
          type: sequelize.QueryTypes.SELECT,
        });
        console.log("My contracts: ", contracts)
        const airtimeAllocation = allocation.AirtimeAllocation;
        const totalMonthlyPayment = contracts3.reduce((total, item) => total + (item.MonthlyPayment || 0), 0);
        console.log("Totaol monthly payment: ",totalMonthlyPayment,airtimeAllocation)
        const calculatedAvailable = (70 / 100) * airtimeAllocation - totalMonthlyPayment;
        console.log("Totaol monthly payment: ",calculatedAvailable)
        const available = parseFloat(calculatedAvailable.toFixed(2));

    res.status(200).json({staffWithAirtimeAllocation, handsetAllocation: allocation.HandsetAllocation, available});
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      message: "Failed to retrieve staff details with airtime details :",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};









exports.data = async (req, res) => {
  try {
    const allTempData = await TempData.findAll();

    // Loop through each record in TempData
    for (const temp of allTempData) {
      const {
        employeeCode,
        firstName,
        lastName,
        cellphone,
        department
      } = temp;

      const fullName = `${firstName} ${lastName}`;
      const userName = `${lastName}${firstName.charAt(0).toUpperCase()}`;// or generate however you prefer
      const email = `${firstName.charAt(0).toLowerCase()}${lastName.toLowerCase()}@mtc.com.na`; // Placeholder
      const today = new Date();

      // Check if the employee already exists
      const existing = await Staff.findOne({ where: { EmployeeCode: employeeCode } });
      if (existing) continue; // Skip existing entries

      await Staff.create({
        EmployeeCode: employeeCode,
        RoleID: 3,            // Replace with actual/default role
        AllocationID: 5,// Replace with actual/default allocation
        FirstName: firstName,
        LastName: lastName,
        FullName: fullName,
        UserName: userName,
        Email: email,
        PhoneNumber: cellphone,
        Gender: "Male",              // Replace with actual or default
        ServicePlan: "Prepaid",         // Replace with actual or default
        Position: department,                  // Replace with actual or default
        Department: department,
        Division: null,                      // Replace with actual or default
        EmploymentCategory: "Temporary",      // Replace with actual or default
        EmploymentStatus: "Active",           // Replace with actual or default
        EmploymentStartDate: null,
        ProfileImage: null                    // Optional
      });
    }

    res.status(200).json({ message: "Staff records inserted successfully." });
  } catch (error) {
    console.error("Error inserting staff records:", error);
    res.status(500).json({ error: "An error occurred while inserting staff records." });
  }
};