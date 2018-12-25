// Model for CanvasUsers collection

// Imports
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const AutoIncrement = require('mongoose-sequence')(mongoose);
const bcrypt = require('bcrypt');

// Schema
const CanvasUserSchema = new Schema({
    id: Number,                             // Unique record ID
    companyName: {                          // Company name, for multi tenant
        type: String,
        required: true
    },
    userID: {                               // userID in Canvas, could be email address via Google
        type: String,
        required: true,
        unique: true
    },
    email: {                                // Email, defaults to Unknown
        type: String,
        required: true
    },
    password: {                             // Encrypted user password
        type: String,
        required: true 
    },
    firstName: String,                      // First Name
    lastName: String,                       // Last Name
    nickName: String,                       // Nickname
    workNumber: String,                     // Work Telephone number
    cellNumber: String,                     // Cell number
    groups: [{type: String}],               // Groups to which user belongs
    isSuperuser: Boolean,                   // Systems supervisor - has ALL powers
    isStaff: Boolean,                       // Is a staff member (and not Guest)
    isActive: Boolean,                      // When False, cannot work on system (ie left company)
    dateJoined: Date,                       // Dt when first registered
    lastLogin: Date,                        // Dt last logged in
    colorScheme: String,                    // Color scheme for Canvas - for later use
    gridSize: Number,                       // Size of Grid on Dashboard in px
    environment: String,                    // Live, Test-Environment-Name
    profilePicture: String,                     
    queryRuntimeWarning: Number,            // Minutes: Warn user if a report is known to run longer
    snapToGrid: Boolean,                    // True: snap Widgets to the grid points on Dashboard
    favouriteDashboards: [{type: Number}],  // IDs of D that are fav of this user
    isFirstTimeUser: Boolean,               // True if not created a D
    isAdministrator: Boolean,               // Role can add/delete users to the group,
        // and assign roles).  Must be at least one administrator role at all times.
    dashboardCanCreateRole: Boolean,            // Role can create Dashboards
    dashboardCanViewRole: Boolean,              // Role can view Dashboards
    dashboardCanEditRole: Boolean,              // Role can change / edit Dashboards
    dashboardCanSaveRole : Boolean,             // Role can save changes to a Dashboards
    dashboardCanDeleteRole: Boolean,            // Role can delete a Dashboard
    dashboardCanGrantAccessRole: Boolean,       // Role can change access to a Dashboard
    dashboardCanAddDatasourceRole: Boolean,     // Role can change add DS to a Dashboard
    datasourceCanCreateRole: Boolean,           // Role can create Datasource
    datasourceCanViewRole: Boolean,             // Role can view Datasource
    datasourceCanEditRole: Boolean,             // Role can change / edit Datasource
    datasourceCanDeleteRole: Boolean,           // Role can delete a Datasource
    datasourceCanGrantAccessRole: Boolean,      // Role can change access to a Datasource
    canManageGroupRole: Boolean,                // Role can add/delete users to Group
    lastPaletteLeft: Number,                    // Last value saved
    lastPaletteTop: Number,                     // Last value saved
    lastAppShowPopupMessageGotIt: Boolean,      // Last value saved
    cleanCacheOnLogin: Boolean,                 // True to clean cache at login
    cleanCacheOnLogout: Boolean,                // True to clean cache at logout
    preferencePaletteHorisontal: Boolean,                   // T/F - Palette Horisontal (else Vertial)
    preferencePlaySound: Boolean,                           // T/F - play a sound when showing a message on the StatusBar
    preferenceAutoSync: Boolean,                            // T/F - can auto sync
    preferenceShowOpenStartupMessage: Boolean,              // T/F - show open startup msg
    preferenceShowOpenDataCombinationMessage: Boolean,      // T/F - show msg on open combination form
    preferenceShowViewStartupMessage: Boolean,              // T/F - show msg on open view form
    preferenceShowDiscardStartupMessage: Boolean,           // T/F - show msg on discard form
    preferenceDefaultTemplateID: Number,                    // Default Template ID
    preferenceDefaultDateformat: String,                    // Default Date Format, ie YYYY/MM/DD
    preferenceDefaultFolder: String,                        // Default Folder
    preferenceDefaultPrinter: String,                       // Default Printer
    preferenceDefaultPageSize: String,                      // Default Page Size
    preferenceDefaultPageLayout: String,                    // Default Page Layout
    preferenceDefaultSnapshotMins: Number,                  // Mins after which a Snapshot must be taken (0 = none)
    preferenceStartupDashboardID: Number,                   // Optional Dashboard ID to show at startup
    preferenceStartupDashboardTabID: Number,                // Optional Dashboard Tab ID to show at startup
    preferenceShowWidgetEditorLite: Boolean,                // True at start, show the Lite editor (not full one)

    // Generated by the system
    editedBy: String,                                       // Last user who edited this task
    editedOn: Date,                                         // Date this task was last edited
    createdBy: String,                                      // UserID who created this task, can be System
    createdOn: {                                            // Date task was created
        type: Date,
        default: Date.now
    }
});

//This is called a pre-hook, before the user information is saved in the database
//this function will be called, we'll get the plain text password, hash it and store it.
CanvasUserSchema.pre('save', async function(next){
    //'this' refers to the current document about to be saved
    const user = this;
    //Hash the password with a salt round of 10, the higher the rounds the more secure, but the slower
    //your application becomes.
    const hash = await bcrypt.hash(this.password, 10);
    //Replace the plain text password with the hash and then store it
    this.password = hash;


    // Get the current date
    var currentDate = new Date();

    // Change the updated_at field to current date
    this.updatedOn = currentDate;

    // If created_at doesn't exist, add to that field
    if (!this.createdOn) {
        this.createdOn = currentDate;
    };

    //Indicates we're done and moves on to the next middleware
    next();
});

//We'll use this later on to make sure that the user trying to log in has the correct credentials
CanvasUserSchema.methods.isValidPassword = async function(password){
    const user = this;
    //Hashes the password sent by the user for login and checks if the hashed password stored in the 
    //database matches the one sent. Returns true if it does else false.
    const compare = await bcrypt.compare(password, user.password);
    return compare;
}

// Auto-Incement the id field
CanvasUserSchema.plugin(AutoIncrement, {inc_field: 'id'});

// Create Model: modelName, schema, collection
const CanvasUserModel = mongoose.model('canvasUsers', CanvasUserSchema, 'canvasUsers');

// Export
module.exports = CanvasUserModel;