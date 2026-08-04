require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const User = require("../models/User");
const Project = require("../models/Project");
const Task = require("../models/Task");
const Responsibility = require("../models/Responsibility");
const Inventory = require("../models/inventoryModel");
const Equipment = require("../models/Equipment");
const Booking = require("../models/Booking");
const Protocol = require("../models/Protocol");

const demoPassword = process.env.SEED_USER_PASSWORD || "LabHubDemo123!";
const isCleanMode = process.argv.includes("--clean");

const protocolUploadDir = path.join(__dirname, "../uploads/protocols");

const addDays = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
};

const escapePdfText = (value) => {
    return value.replace(/[()\\]/g, "\\$&");
};

const slugify = (value) => {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
};

const assertSafeMongoTarget = () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        throw new Error("MONGO_URI is required to run the demo seed.");
    }

    const normalizedUri = mongoUri.toLowerCase();
    const isLocalDatabase =
        normalizedUri.includes("localhost") ||
        normalizedUri.includes("127.0.0.1") ||
        normalizedUri.includes("::1");

    if (!isLocalDatabase && process.env.ALLOW_REMOTE_SEED !== "true") {
        throw new Error(
            "Refusing to seed a non-local MongoDB target. Set ALLOW_REMOTE_SEED=true only for an intentional demo database."
        );
    }
};

const connect = async () => {
    assertSafeMongoTarget();

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(
        `Connected to MongoDB host "${conn.connection.host}", database "${conn.connection.name}".`
    );
};

const close = async () => {
    await mongoose.connection.close();
};

const upsertUser = async (userData) => {
    const nameQuery = {
        firstName: new RegExp(`^${userData.firstName}$`, "i"),
        lastName: new RegExp(`^${userData.lastName}$`, "i"),
    };

    const user =
        (await User.findOne({
            email: userData.email,
        }).select("+password")) ||
        (await User.findOne(nameQuery).select("+password"));

    if (user) {
        user.firstName = userData.firstName;
        user.lastName = userData.lastName;
        user.email = userData.email;
        user.role = userData.role;
        user.labPosition = userData.labPosition;
        user.password = demoPassword;
        return user.save();
    }

    return User.create({
        ...userData,
        password: demoPassword,
    });
};

const removeTestMember = async () => {
    const users = await User.find({});
    const testUsers = users.filter((user) => {
        const firstName = (user.firstName || "").trim().toLowerCase();
        const lastName = (user.lastName || "").trim().toLowerCase();
        const fullName = `${firstName} ${lastName}`.trim();
        const email = (user.email || "").trim().toLowerCase();

        return (
            fullName === "test member" ||
            (firstName === "test" && lastName === "member") ||
            email === "test.member@labhub.demo" ||
            email === "test-member@labhub.demo" ||
            email === "test_member@labhub.demo"
        );
    });

    if (testUsers.length > 0) {
        await User.deleteMany({
            _id: {
                $in: testUsers.map((user) => user._id),
            },
        });
    }

    return testUsers.length;
};

const userDefinitions = [
    {
        key: "izhak",
        firstName: "Izhak",
        lastName: "Kehat",
        email: "izhak.kehat@labhub.demo",
        role: "admin",
        labPosition: "principal_investigator",
    },
    {
        key: "shelly",
        firstName: "Shelly",
        lastName: "Marienberg",
        email: "shelly.marienberg@labhub.demo",
        role: "researcher",
        labPosition: "md_phd_student",
    },
    // Fictional demonstration accounts for academic submission.
    {
        key: "noa",
        firstName: "Noa",
        lastName: "Ben-David",
        email: "noa.ben-david@labhub.demo",
        role: "researcher",
        labPosition: "researcher",
    },
    {
        key: "amir",
        firstName: "Amir",
        lastName: "Cohen",
        email: "amir.cohen@labhub.demo",
        role: "researcher",
        labPosition: "md_student",
    },
    {
        key: "yael",
        firstName: "Yael",
        lastName: "Levi",
        email: "yael.levi@labhub.demo",
        role: "researcher",
        labPosition: "lab_manager",
    },
    {
        key: "daniel",
        firstName: "Daniel",
        lastName: "Rosen",
        email: "daniel.rosen@labhub.demo",
        role: "researcher",
        labPosition: "lab_technician",
    },
    {
        key: "maya",
        firstName: "Maya",
        lastName: "Stein",
        email: "maya.stein@labhub.demo",
        role: "researcher",
        labPosition: "undergraduate_research_assistant",
    },
    {
        key: "eitan",
        firstName: "Eitan",
        lastName: "Barak",
        email: "eitan.barak@labhub.demo",
        role: "researcher",
        labPosition: "other",
    },
];

const getUsers = async () => {
    const removedTestUsers = await removeTestMember();
    const users = {};

    for (const definition of userDefinitions) {
        users[definition.key] = await upsertUser(definition);
    }

    return {
        users,
        removedTestUsers,
    };
};

const upsertByField = async (Model, field, value, data) => {
    const existing = await Model.findOne({
        [field]: value,
    });

    if (existing) {
        Object.assign(existing, data);
        return existing.save();
    }

    return Model.create(data);
};

const seedProjects = async (users) => {
    const projectDefinitions = [
        {
            title: "Localized Translation in the Heart",
            description:
                "Tracks how local protein production may support cardiac cell adaptation during stress and recovery.",
            status: "active",
            priority: "high",
            startDate: addDays(-120),
            endDate: addDays(180),
            owner: users.izhak._id,
            members: [users.izhak._id, users.shelly._id, users.noa._id],
            notes: "Demo project based on a public research theme.",
            createdBy: users.izhak._id,
        },
        {
            title: "Signaling Pathways in Heart Failure",
            description:
                "Studies molecular signaling patterns connected with cardiac remodeling and heart failure progression.",
            status: "active",
            priority: "high",
            startDate: addDays(-90),
            endDate: addDays(240),
            owner: users.izhak._id,
            members: [users.izhak._id, users.shelly._id, users.amir._id],
            notes: "Demo project for pathway analysis workflows.",
            createdBy: users.izhak._id,
        },
        {
            title: "Genome Organization in Cardiac Remodeling",
            description:
                "Explores changes in genome organization associated with cardiac remodeling models.",
            status: "planning",
            priority: "medium",
            startDate: addDays(-30),
            endDate: addDays(300),
            owner: users.izhak._id,
            members: [users.izhak._id, users.noa._id, users.eitan._id],
            notes: "Demo project for genomics coordination.",
            createdBy: users.izhak._id,
        },
        {
            title: "Vascular and Valve Calcification",
            description:
                "Coordinates data review and sample tracking for vascular and valve calcification research workflows.",
            status: "active",
            priority: "medium",
            startDate: addDays(-60),
            endDate: addDays(210),
            owner: users.izhak._id,
            members: [users.izhak._id, users.yael._id, users.daniel._id],
            notes: "Demo project for multidisciplinary lab operations.",
            createdBy: users.izhak._id,
        },
    ];

    const projects = {};

    for (const project of projectDefinitions) {
        projects[slugify(project.title)] = await upsertByField(
            Project,
            "title",
            project.title,
            project
        );
    }

    return projects;
};

const seedTasks = async (users, projects) => {
    const translationProject = projects["localized-translation-in-the-heart"];
    const signalingProject = projects["signaling-pathways-in-heart-failure"];
    const genomeProject = projects["genome-organization-in-cardiac-remodeling"];
    const calcificationProject = projects["vascular-and-valve-calcification"];

    const taskDefinitions = [
        {
            title: "Prepare cardiomyocyte sample batch",
            description: "Coordinate sample labeling and readiness checks for upcoming analysis.",
            taskType: "lab",
            taskCategory: "experiment",
            status: "in_progress",
            priority: "high",
            assignedTo: [users.shelly._id],
            dueDate: addDays(4),
            recurrence: "none",
            createdBy: users.izhak._id,
        },
        {
            title: "Review imaging dataset",
            description: "Review image organization and flag files that need follow-up annotation.",
            taskType: "project",
            taskCategory: "analysis",
            status: "todo",
            priority: "medium",
            assignedTo: [users.noa._id],
            project: translationProject._id,
            dueDate: addDays(7),
            recurrence: "none",
            createdBy: users.izhak._id,
        },
        {
            title: "Update experimental protocol metadata",
            description: "Check protocol titles, categories, and file naming for consistency.",
            taskType: "lab",
            taskCategory: "publication",
            status: "todo",
            priority: "medium",
            assignedTo: [users.yael._id],
            dueDate: addDays(10),
            recurrence: "weekly",
            createdBy: users.izhak._id,
        },
        {
            title: "Analyze gene-expression summary results",
            description: "Prepare a concise summary table for internal discussion.",
            taskType: "project",
            taskCategory: "analysis",
            status: "completed",
            priority: "high",
            assignedTo: [users.shelly._id],
            project: signalingProject._id,
            dueDate: addDays(-2),
            recurrence: "none",
            createdBy: users.izhak._id,
        },
        {
            title: "Calibrate microscopy equipment",
            description: "Confirm calibration checklist status and log any service needs.",
            taskType: "lab",
            taskCategory: "maintenance",
            status: "todo",
            priority: "urgent",
            assignedTo: [users.daniel._id],
            dueDate: addDays(-3),
            recurrence: "monthly",
            createdBy: users.yael._id,
        },
        {
            title: "Organize weekly project meeting",
            description: "Collect agenda items and update the project discussion plan.",
            taskType: "lab",
            taskCategory: "general",
            status: "in_progress",
            priority: "medium",
            assignedTo: [users.maya._id],
            dueDate: addDays(2),
            recurrence: "weekly",
            createdBy: users.izhak._id,
        },
        {
            title: "Validate inventory requirements",
            description: "Review low-stock items and prepare ordering notes for lab review.",
            taskType: "lab",
            taskCategory: "reagent_preparation",
            status: "todo",
            priority: "high",
            assignedTo: [users.yael._id],
            dueDate: addDays(5),
            recurrence: "weekly",
            createdBy: users.izhak._id,
        },
        {
            title: "Prepare presentation for lab meeting",
            description: "Create a short progress update for current cardiac remodeling work.",
            taskType: "project",
            taskCategory: "publication",
            status: "todo",
            priority: "medium",
            assignedTo: [users.eitan._id],
            project: genomeProject._id,
            dueDate: addDays(12),
            recurrence: "none",
            createdBy: users.izhak._id,
        },
        {
            title: "Check cell culture room supplies",
            description: "Review routine supply availability without including experimental instructions.",
            taskType: "lab",
            taskCategory: "cleaning",
            status: "completed",
            priority: "low",
            assignedTo: [users.maya._id],
            dueDate: addDays(-1),
            recurrence: "weekly",
            createdBy: users.yael._id,
        },
        {
            title: "Compile calcification image notes",
            description: "Summarize image review notes for the calcification project workspace.",
            taskType: "project",
            taskCategory: "analysis",
            status: "in_progress",
            priority: "medium",
            assignedTo: [users.daniel._id],
            project: calcificationProject._id,
            dueDate: addDays(6),
            recurrence: "none",
            createdBy: users.izhak._id,
        },
        {
            title: "Review cardiac remodeling references",
            description: "Collect recent reference notes for internal project discussion.",
            taskType: "project",
            taskCategory: "publication",
            status: "completed",
            priority: "medium",
            assignedTo: [users.noa._id],
            project: genomeProject._id,
            dueDate: addDays(-4),
            recurrence: "none",
            createdBy: users.izhak._id,
        },
        {
            title: "Confirm freezer inventory labels",
            description: "Check that storage labels are readable and update the inventory notes.",
            taskType: "lab",
            taskCategory: "maintenance",
            status: "todo",
            priority: "medium",
            assignedTo: [users.daniel._id],
            dueDate: addDays(-5),
            recurrence: "monthly",
            createdBy: users.yael._id,
        },
        {
            title: "Prepare pathway analysis checklist",
            description: "Create a non-experimental checklist for pathway analysis files.",
            taskType: "project",
            taskCategory: "analysis",
            status: "todo",
            priority: "high",
            assignedTo: [users.amir._id],
            project: signalingProject._id,
            dueDate: addDays(9),
            recurrence: "none",
            createdBy: users.izhak._id,
        },
        {
            title: "Update lab safety documentation index",
            description: "Review document names and confirm the safety folder index is current.",
            taskType: "lab",
            taskCategory: "general",
            status: "cancelled",
            priority: "low",
            assignedTo: [users.yael._id],
            dueDate: addDays(15),
            recurrence: "none",
            createdBy: users.izhak._id,
        },
        {
            title: "Coordinate valve calcification sample log",
            description: "Check that sample log entries have dates, owner names, and storage locations.",
            taskType: "project",
            taskCategory: "general",
            status: "in_progress",
            priority: "high",
            assignedTo: [users.yael._id],
            project: calcificationProject._id,
            dueDate: addDays(3),
            recurrence: "none",
            createdBy: users.izhak._id,
        },
        {
            title: "Prepare shared data organization notes",
            description: "Summarize folder naming conventions for internal data organization.",
            taskType: "lab",
            taskCategory: "general",
            status: "completed",
            priority: "low",
            assignedTo: [users.eitan._id],
            dueDate: addDays(-6),
            recurrence: "none",
            createdBy: users.izhak._id,
        },
    ];

    for (const task of taskDefinitions) {
        await upsertByField(Task, "title", task.title, task);
    }

    return taskDefinitions.length;
};

const seedResponsibilities = async (users) => {
    const responsibilityDefinitions = [
        {
            title: "Cell culture room coordination",
            description: "Coordinate shared room readiness and routine administrative checks.",
            category: "cell_culture",
            assignedTo: users.shelly._id,
            backupUser: users.maya._id,
            startDate: addDays(-45),
            endDate: null,
            isActive: true,
            createdBy: users.izhak._id,
        },
        {
            title: "Freezer inventory monitoring",
            description: "Review freezer inventory records and flag items needing attention.",
            category: "freezer_monitoring",
            assignedTo: users.daniel._id,
            backupUser: users.yael._id,
            startDate: addDays(-30),
            endDate: null,
            isActive: true,
            createdBy: users.izhak._id,
        },
        {
            title: "Equipment maintenance coordination",
            description: "Track service notes and coordinate shared equipment status updates.",
            category: "equipment",
            assignedTo: users.yael._id,
            backupUser: users.daniel._id,
            startDate: addDays(-60),
            endDate: null,
            isActive: true,
            createdBy: users.izhak._id,
        },
        {
            title: "Protocol library review",
            description: "Keep protocol metadata organized and ensure documents are easy to find.",
            category: "protocols",
            assignedTo: users.noa._id,
            backupUser: users.eitan._id,
            startDate: addDays(-20),
            endDate: null,
            isActive: true,
            createdBy: users.izhak._id,
        },
        {
            title: "Laboratory safety documentation",
            description: "Maintain the internal index for general lab safety documentation.",
            category: "safety",
            assignedTo: users.yael._id,
            backupUser: users.shelly._id,
            startDate: addDays(-75),
            endDate: null,
            isActive: true,
            createdBy: users.izhak._id,
        },
        {
            title: "Weekly lab meeting coordination",
            description: "Coordinate meeting agenda collection and follow-up notes.",
            category: "general",
            assignedTo: users.maya._id,
            backupUser: users.amir._id,
            startDate: addDays(-14),
            endDate: null,
            isActive: true,
            createdBy: users.izhak._id,
        },
    ];

    for (const responsibility of responsibilityDefinitions) {
        await upsertByField(
            Responsibility,
            "title",
            responsibility.title,
            responsibility
        );
    }

    return responsibilityDefinitions.length;
};

const seedInventory = async (users) => {
    const inventoryDefinitions = [
        {
            name: "PCR Reagent Master Mix",
            description: "Generic reagent stock for demonstration inventory tracking.",
            category: "reagent",
            unit: "tubes",
            quantity: 4,
            minimumQuantity: 6,
            location: "Molecular Biology Room",
            supplier: "Demo Scientific",
            catalogNumber: "DEMO-PCR-001",
            expirationDate: addDays(120),
            responsibleUser: users.yael._id,
            notes: "Low stock demo item.",
            createdBy: users.izhak._id,
            isActive: true,
        },
        {
            name: "Cell Culture Medium",
            description: "Generic medium record for stock planning.",
            category: "medium",
            unit: "bottles",
            quantity: 12,
            minimumQuantity: 4,
            location: "Cell Culture Room",
            supplier: "Demo BioSupply",
            catalogNumber: "DEMO-MED-010",
            expirationDate: addDays(45),
            responsibleUser: users.shelly._id,
            notes: "Adequate stock.",
            createdBy: users.izhak._id,
            isActive: true,
        },
        {
            name: "Filtered Pipette Tips",
            description: "General consumable stock for routine lab work.",
            category: "consumable",
            unit: "boxes",
            quantity: 3,
            minimumQuantity: 3,
            location: "Shared Equipment Area",
            supplier: "Demo Labware",
            catalogNumber: "DEMO-TIP-200",
            expirationDate: null,
            responsibleUser: users.maya._id,
            notes: "At minimum quantity.",
            createdBy: users.izhak._id,
            isActive: true,
        },
        {
            name: "Cardiac Marker Antibody",
            description: "Generic antibody inventory entry for demonstration.",
            category: "antibody",
            unit: "tubes",
            quantity: 2,
            minimumQuantity: 1,
            location: "Cold Storage",
            supplier: "Demo Antibodies",
            catalogNumber: "DEMO-AB-042",
            expirationDate: addDays(-20),
            responsibleUser: users.noa._id,
            notes: "Expired demo item.",
            createdBy: users.izhak._id,
            isActive: true,
        },
        {
            name: "RNA Extraction Kit",
            description: "Generic kit stock for molecular biology workflows.",
            category: "kit",
            unit: "boxes",
            quantity: 1,
            minimumQuantity: 2,
            location: "Molecular Biology Room",
            supplier: "Demo Molecular",
            catalogNumber: "DEMO-RNA-100",
            expirationDate: addDays(30),
            responsibleUser: users.amir._id,
            notes: "Low stock and expiring soon.",
            createdBy: users.izhak._id,
            isActive: true,
        },
        {
            name: "Cryogenic Tubes",
            description: "Generic sample storage consumable.",
            category: "consumable",
            unit: "packs",
            quantity: 8,
            minimumQuantity: 3,
            location: "Freezer Area",
            supplier: "Demo Labware",
            catalogNumber: "DEMO-CRYO-050",
            expirationDate: null,
            responsibleUser: users.daniel._id,
            notes: "Adequate stock.",
            createdBy: users.izhak._id,
            isActive: true,
        },
        {
            name: "Nitrile Gloves",
            description: "General protective consumable inventory record.",
            category: "consumable",
            unit: "boxes",
            quantity: 16,
            minimumQuantity: 6,
            location: "Shared Equipment Area",
            supplier: "Demo Safety",
            catalogNumber: "DEMO-GLV-001",
            expirationDate: null,
            responsibleUser: users.yael._id,
            notes: "Routine stock.",
            createdBy: users.izhak._id,
            isActive: true,
        },
        {
            name: "Microscope Slides",
            description: "Generic imaging consumable record.",
            category: "consumable",
            unit: "packs",
            quantity: 5,
            minimumQuantity: 2,
            location: "Imaging Room",
            supplier: "Demo Glassware",
            catalogNumber: "DEMO-SLD-010",
            expirationDate: null,
            responsibleUser: users.noa._id,
            notes: "Adequate stock.",
            createdBy: users.izhak._id,
            isActive: true,
        },
        {
            name: "Buffer Solution",
            description: "Generic buffer stock record.",
            category: "buffer",
            unit: "bottles",
            quantity: 2,
            minimumQuantity: 5,
            location: "Molecular Biology Room",
            supplier: "Demo Chemicals",
            catalogNumber: "DEMO-BUF-020",
            expirationDate: addDays(-8),
            responsibleUser: users.amir._id,
            notes: "Low stock and expired demo item.",
            createdBy: users.izhak._id,
            isActive: true,
        },
        {
            name: "Primer Set A",
            description: "Generic primer inventory example.",
            category: "primer",
            unit: "tubes",
            quantity: 10,
            minimumQuantity: 3,
            location: "Molecular Biology Room",
            supplier: "Demo Oligos",
            catalogNumber: "DEMO-PRM-A",
            expirationDate: addDays(180),
            responsibleUser: users.eitan._id,
            notes: "Adequate stock.",
            createdBy: users.izhak._id,
            isActive: true,
        },
        {
            name: "Biological Sample Labels",
            description: "Generic labeling supply for sample organization.",
            category: "biological_sample",
            unit: "packs",
            quantity: 2,
            minimumQuantity: 4,
            location: "Shared Equipment Area",
            supplier: "Demo Labels",
            catalogNumber: "DEMO-LBL-001",
            expirationDate: addDays(365),
            responsibleUser: users.maya._id,
            notes: "Low stock demo item.",
            createdBy: users.izhak._id,
            isActive: true,
        },
        {
            name: "Centrifuge Rotor Adapter",
            description: "Generic equipment part record.",
            category: "equipment_part",
            unit: "units",
            quantity: 1,
            minimumQuantity: 1,
            location: "Shared Equipment Area",
            supplier: "Demo Instruments",
            catalogNumber: "DEMO-ROT-002",
            expirationDate: null,
            responsibleUser: users.daniel._id,
            notes: "At minimum quantity.",
            createdBy: users.izhak._id,
            isActive: true,
        },
    ];

    for (const item of inventoryDefinitions) {
        await upsertByField(Inventory, "name", item.name, item);
    }

    return inventoryDefinitions.length;
};

const seedEquipment = async (users) => {
    const equipmentDefinitions = [
        {
            name: "Confocal Microscope",
            description: "Shared imaging system for demonstration booking and status workflows.",
            category: "microscope",
            location: "Imaging Room",
            status: "available",
            createdBy: users.izhak._id,
            isActive: true,
        },
        {
            name: "Real-Time PCR System",
            description: "Shared molecular biology instrument record.",
            category: "pcr_machine",
            location: "Molecular Biology Room",
            status: "available",
            createdBy: users.izhak._id,
            isActive: true,
        },
        {
            name: "Cell Culture Incubator",
            description: "Cell culture equipment record for operational tracking.",
            category: "incubator",
            location: "Cell Culture Room",
            status: "maintenance",
            createdBy: users.izhak._id,
            isActive: true,
        },
        {
            name: "Refrigerated Centrifuge",
            description: "Shared centrifuge record with available status.",
            category: "centrifuge",
            location: "Shared Equipment Area",
            status: "available",
            createdBy: users.izhak._id,
            isActive: true,
        },
        {
            name: "Gel Imaging System",
            description: "Imaging system used for general lab documentation.",
            category: "imaging",
            location: "Molecular Biology Room",
            status: "available",
            createdBy: users.izhak._id,
            isActive: true,
        },
        {
            name: "Plate Reader",
            description: "General shared measurement equipment record.",
            category: "general",
            location: "Shared Equipment Area",
            status: "out_of_service",
            createdBy: users.izhak._id,
            isActive: true,
        },
        {
            name: "Ultra-Low Temperature Freezer",
            description: "Shared freezer record for inventory and equipment dashboards.",
            category: "freezer",
            location: "Freezer Area",
            status: "available",
            createdBy: users.izhak._id,
            isActive: true,
        },
    ];

    const equipment = {};

    for (const item of equipmentDefinitions) {
        equipment[slugify(item.name)] = await upsertByField(
            Equipment,
            "name",
            item.name,
            item
        );
    }

    return equipment;
};

const seedBookings = async (users, equipment) => {
    const bookingDefinitions = [
        {
            purpose: "Demo booking: imaging dataset review",
            equipment: equipment["confocal-microscope"]._id,
            bookedBy: users.noa._id,
            createdBy: users.noa._id,
            startTime: addDays(2),
            endTime: new Date(addDays(2).getTime() + 2 * 60 * 60 * 1000),
            status: "active",
        },
        {
            purpose: "Demo booking: pathway analysis run",
            equipment: equipment["real-time-pcr-system"]._id,
            bookedBy: users.shelly._id,
            createdBy: users.shelly._id,
            startTime: addDays(3),
            endTime: new Date(addDays(3).getTime() + 90 * 60 * 1000),
            status: "active",
        },
        {
            purpose: "Demo booking: centrifuge scheduling",
            equipment: equipment["refrigerated-centrifuge"]._id,
            bookedBy: users.daniel._id,
            createdBy: users.daniel._id,
            startTime: addDays(5),
            endTime: new Date(addDays(5).getTime() + 60 * 60 * 1000),
            status: "active",
        },
        {
            purpose: "Demo booking: completed gel documentation",
            equipment: equipment["gel-imaging-system"]._id,
            bookedBy: users.amir._id,
            createdBy: users.amir._id,
            startTime: addDays(-10),
            endTime: new Date(addDays(-10).getTime() + 90 * 60 * 1000),
            status: "completed",
        },
        {
            purpose: "Demo booking: completed freezer inventory review",
            equipment: equipment["ultra-low-temperature-freezer"]._id,
            bookedBy: users.yael._id,
            createdBy: users.yael._id,
            startTime: addDays(-4),
            endTime: new Date(addDays(-4).getTime() + 45 * 60 * 1000),
            status: "completed",
        },
        {
            purpose: "Demo booking: cancelled imaging slot",
            equipment: equipment["confocal-microscope"]._id,
            bookedBy: users.eitan._id,
            createdBy: users.eitan._id,
            startTime: addDays(9),
            endTime: new Date(addDays(9).getTime() + 60 * 60 * 1000),
            status: "cancelled",
        },
        {
            purpose: "Demo booking: cancelled molecular biology slot",
            equipment: equipment["real-time-pcr-system"]._id,
            bookedBy: users.maya._id,
            createdBy: users.maya._id,
            startTime: addDays(11),
            endTime: new Date(addDays(11).getTime() + 60 * 60 * 1000),
            status: "cancelled",
        },
    ];

    for (const booking of bookingDefinitions) {
        const existing = await Booking.findOne({
            purpose: booking.purpose,
        });

        if (existing) {
            Object.assign(existing, booking);
            await existing.save();
        } else {
            await Booking.create(booking);
        }
    }

    return bookingDefinitions.length;
};

const createDemoPdf = async (filePath, title, body) => {
    const stream = `BT
/F1 18 Tf
72 720 Td
(${escapePdfText(title)}) Tj
/F1 11 Tf
0 -32 Td
(${escapePdfText(body)}) Tj
0 -18 Td
(Demonstration document for LabHub seed data only.) Tj
0 -18 Td
(Not an experimental protocol or safety instruction.) Tj
ET`;

    const objects = [
        "<< /Type /Catalog /Pages 2 0 R >>",
        "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
        `<< /Length ${Buffer.byteLength(stream, "utf8")} >>
stream
${stream}
endstream`,
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ];

    let pdfContent = "%PDF-1.4\n";
    const offsets = [0];

    objects.forEach((object, index) => {
        offsets.push(Buffer.byteLength(pdfContent, "utf8"));
        pdfContent += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });

    const xrefOffset = Buffer.byteLength(pdfContent, "utf8");

    pdfContent += `xref
0 ${objects.length + 1}
0000000000 65535 f 
${offsets
    .slice(1)
    .map((offset) => `${offset.toString().padStart(10, "0")} 00000 n `)
    .join("\n")}
trailer
<< /Size ${objects.length + 1} /Root 1 0 R >>
startxref
${xrefOffset}
%%EOF
`;

    await fs.promises.writeFile(filePath, pdfContent, "utf8");
};

const seedProtocols = async (users) => {
    await fs.promises.mkdir(protocolUploadDir, {
        recursive: true,
    });

    const protocolDefinitions = [
        {
            title: "General Cell Culture Documentation",
            description: "Administrative demo document for organizing cell culture records.",
            category: "cell_culture",
            uploadedBy: users.shelly._id,
        },
        {
            title: "Equipment Calibration Checklist",
            description: "Administrative demo checklist for equipment status review.",
            category: "imaging",
            uploadedBy: users.daniel._id,
        },
        {
            title: "Sample Labeling and Storage Guidelines",
            description: "Administrative demo document for sample naming and storage tracking.",
            category: "general",
            uploadedBy: users.yael._id,
        },
        {
            title: "Laboratory Data Organization Procedure",
            description: "Administrative demo document for shared data organization.",
            category: "general",
            uploadedBy: users.eitan._id,
        },
    ];

    for (const protocol of protocolDefinitions) {
        const fileName = `demo-${slugify(protocol.title)}.pdf`;
        const filePath = path.join(protocolUploadDir, fileName);

        await createDemoPdf(
            filePath,
            protocol.title,
            protocol.description
        );

        const fileStats = await fs.promises.stat(filePath);
        const data = {
            ...protocol,
            fileName,
            originalFileName: fileName,
            filePath,
            fileType: "application/pdf",
            fileSize: fileStats.size,
            isActive: true,
        };

        const existing = await Protocol.findOne({
            title: protocol.title,
        });

        if (existing) {
            Object.assign(existing, data);
            await existing.save();
        } else {
            await Protocol.create(data);
        }
    }

    return protocolDefinitions.length;
};

const cleanDemoData = async () => {
    const fictionalEmails = userDefinitions
        .filter((user) => !["izhak", "shelly"].includes(user.key))
        .map((user) => user.email);

    const projectTitles = [
        "Localized Translation in the Heart",
        "Signaling Pathways in Heart Failure",
        "Genome Organization in Cardiac Remodeling",
        "Vascular and Valve Calcification",
    ];

    const taskTitles = [
        "Prepare cardiomyocyte sample batch",
        "Review imaging dataset",
        "Update experimental protocol metadata",
        "Analyze gene-expression summary results",
        "Calibrate microscopy equipment",
        "Organize weekly project meeting",
        "Validate inventory requirements",
        "Prepare presentation for lab meeting",
        "Check cell culture room supplies",
        "Compile calcification image notes",
        "Review cardiac remodeling references",
        "Confirm freezer inventory labels",
        "Prepare pathway analysis checklist",
        "Update lab safety documentation index",
        "Coordinate valve calcification sample log",
        "Prepare shared data organization notes",
    ];

    const responsibilityTitles = [
        "Cell culture room coordination",
        "Freezer inventory monitoring",
        "Equipment maintenance coordination",
        "Protocol library review",
        "Laboratory safety documentation",
        "Weekly lab meeting coordination",
    ];

    const inventoryNames = [
        "PCR Reagent Master Mix",
        "Cell Culture Medium",
        "Filtered Pipette Tips",
        "Cardiac Marker Antibody",
        "RNA Extraction Kit",
        "Cryogenic Tubes",
        "Nitrile Gloves",
        "Microscope Slides",
        "Buffer Solution",
        "Primer Set A",
        "Biological Sample Labels",
        "Centrifuge Rotor Adapter",
    ];

    const equipmentNames = [
        "Confocal Microscope",
        "Real-Time PCR System",
        "Cell Culture Incubator",
        "Refrigerated Centrifuge",
        "Gel Imaging System",
        "Plate Reader",
        "Ultra-Low Temperature Freezer",
    ];

    const protocolTitles = [
        "General Cell Culture Documentation",
        "Equipment Calibration Checklist",
        "Sample Labeling and Storage Guidelines",
        "Laboratory Data Organization Procedure",
    ];

    const bookingPurposes = [
        "Demo booking: imaging dataset review",
        "Demo booking: pathway analysis run",
        "Demo booking: centrifuge scheduling",
        "Demo booking: completed gel documentation",
        "Demo booking: completed freezer inventory review",
        "Demo booking: cancelled imaging slot",
        "Demo booking: cancelled molecular biology slot",
    ];

    await Booking.deleteMany({
        purpose: {
            $in: bookingPurposes,
        },
    });
    await Protocol.deleteMany({
        title: {
            $in: protocolTitles,
        },
    });
    await Task.deleteMany({
        title: {
            $in: taskTitles,
        },
    });
    await Responsibility.deleteMany({
        title: {
            $in: responsibilityTitles,
        },
    });
    await Inventory.deleteMany({
        name: {
            $in: inventoryNames,
        },
    });
    await Equipment.deleteMany({
        name: {
            $in: equipmentNames,
        },
    });
    await Project.deleteMany({
        title: {
            $in: projectTitles,
        },
    });
    await User.deleteMany({
        email: {
            $in: fictionalEmails,
        },
    });

    for (const title of protocolTitles) {
        const fileName = `demo-${slugify(title)}.pdf`;
        const filePath = path.join(protocolUploadDir, fileName);

        if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
        }
    }
};

const runSeed = async () => {
    await connect();

    if (isCleanMode) {
        await cleanDemoData();
        const removedTestUsers = await removeTestMember();

        console.log("Demo seed records cleaned.");
        console.log(`TEST MEMBER records removed: ${removedTestUsers}`);
        return;
    }

    const { users, removedTestUsers } = await getUsers();
    const projects = await seedProjects(users);
    const taskCount = await seedTasks(users, projects);
    const responsibilityCount = await seedResponsibilities(users);
    const inventoryCount = await seedInventory(users);
    const equipment = await seedEquipment(users);
    const bookingCount = await seedBookings(users, equipment);
    const protocolCount = await seedProtocols(users);

    console.log("Demo seed completed successfully.");
    console.log(`TEST MEMBER records removed: ${removedTestUsers}`);
    console.log(`Users upserted: ${userDefinitions.length}`);
    console.log("Projects upserted: 4");
    console.log(`Tasks upserted: ${taskCount}`);
    console.log(`Responsibilities upserted: ${responsibilityCount}`);
    console.log(`Inventory items upserted: ${inventoryCount}`);
    console.log("Equipment records upserted: 7");
    console.log(`Bookings upserted: ${bookingCount}`);
    console.log(`Protocols upserted: ${protocolCount}`);
    console.log(
        "Demo password source: SEED_USER_PASSWORD environment variable or documented development fallback."
    );
};

runSeed()
    .catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await close();
    });
