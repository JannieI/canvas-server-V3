// Model for CanvasUsers collection

const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const CanvasUserSchema = new Schema({
    id: Number,                             // Unique record ID
    userID: String,                         // Unique UserID
    password: String,                       // Password
    firstName: String,                      // First Name
    lastName: String,                       // Last Name
    nickName: String,                       // Nickname
    email: String,                          // Email Address
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
        // `Date.now()` returns the current unix timestamp as a number
        default: Date.now
      }
});


// Create Model: modelName, schema, collection
const CanvasUserModel = mongoose.model('canvasUsers', CanvasUserSchema, 'canvasUsers');

module.exports = CanvasUserModel;