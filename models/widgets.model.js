// Model for widgets collection - a portion of the fields to try to get it working

// Imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const counterModel = require('./counters')

// Sub-Schemas
const dataSchemaInterface = new Schema({
    name: String,                           // Name of Field (DB or Calculated)
    typeName: String,                       // ie String
    type: String,                           // ie string
    length: Number,                         // Optional field length
    isCalculated: Boolean,                  // True if calculated
    calculatedExpression: String            // Formula for calculated fields
})

const DataParameters = new Schema({
    field: String, 
    value: String
})

const GraphTransformations = new Schema({
    id: Number,                     // Unique ID
    sequence: Number,               // Sequence Nr
    transformationType: String      // ie Calculat, Filter aka Vega-Lite spec
})

const GraphCalculation = new Schema({
    id: Number,                             // Unique ID
    sequence: Number,                       // Sequence Nr - for LATER user
    calculatedExpression: String,           // Expression, ie sin(datum.ValueTraded)
    calculatedAs: String,                   // Name of resultant calculated field
    calculatedDataType: String              // Data type of newly calculated field
})

const GraphFilter = new Schema({
    id: Number,                             // Unique ID
    sequence: Number,                       // Sequence Nr - for LATER user
    filterFieldName: String,                // Name (text) of field
    filterOperator: String,                 // ie Equal, Less Than, etc
    filterTimeUnit: String,                 // ie Year, Month, Day
    filterValue: String,                    // ie. 12 Japan  1,5  a,b,c  true
    filterValueFrom: String,                // From value for Range
    filterValueTo: String,                  // To value for Range
    isActive: Boolean                       // True if activated, else not used
})

const WidgetGraphSpecification = new Schema({

    // Optional Specification, used for Custom graphTypes
    graphSpecification: Object,             // Vega specification

    // Mark
    graphMark: String,                      // Mark, ie bar, line, etc
    graphMarkOrient: String,                // Horisontal/Verticle - ie for bar when both axis numbers
    graphMarkLine: Boolean,                 // True to add line, ie for Area graph
    graphMarkPoint: Boolean,                // True to add point, ie for Area graph
    graphMarkPointColorName: String,        // Name of Point colour
    graphMarkPointColor: String,            // Actual Point colour in hex
    graphMarkColourName: String,            // Name of Mark colour (if colour channel not used)
    graphMarkColour: String,                // Actual Mark colour in hex
    graphMarkCornerRadius: Number,          // Size of corner radius, ie for bar
    graphMarkExtent: String,                // Extent: ci, stderr, stdev, irq for Error Band & -Bar
    graphMarkOpacity: Number,               // Opacity of Mark, 0 to 1
    graphMarkBinSpacing: Number,            // Space between bins, ie 0 or 1 (stats or nice)
    graphMarkInterpolate: String,           // Interpolation
    graphMarkSize: Number,                  // Size of the Mark

    // X
    graphXfield: String,                    // Field name on the X Channel
    graphXaggregateName: String,            // Aggregation Name on X Channel, ie Average
    graphXaggregate: String,                // Aggregation on X Channel, ie average
    graphXtimeUnit: String,                 // Time Unit, ie Year, Month, etc
    graphXbin: Boolean,                     // True if channel is binned
    graphXMaxBins: Number,                  // Max nr of ESTIMATED bins
    graphXformat: String,                   // Format in D3-format
    graphXimpute: String,                   // Calculate missing values based on method/value
    graphXimputeValue: Number,              // Value if impute = VALUE
    graphXstack: String,                    // Way that field is stacked, ie Normalised
    graphXsort: String,                     // Sort order of field
    graphXtype: String,                     // Graph type, ie nominal
    graphXtypeName: String,                 // Name of the graph type, ie Nominal

    // Y
    graphYfield: String,                    // Field name on the Y Channel
    graphYaggregateName: String,            // Aggregation Name on Y, ie Average
    graphYaggregate: String,                // Aggregation on Y Channel, ie average
    graphYbin: Boolean,                     // True if channel is binned
    graphYMaxBins: Number,                  // Max nr of ESTIMATED bins
    graphYformat: String,                   // Format in D3-format
    graphYimpute: String,                   // Calculate missing values based on method/value
    graphYimputeValue: Number,              // Value if impute = VALUE
    graphYstack: String,                    // Way that field is stacked, ie Normalised
    graphYsort: String,                     // Sort order of field
    graphYtimeUnit: String,                 // Time unit, ie Year, Month, etc
    graphYtype: String,                     // Graph type, ie nominal
    graphYtypeName: String,                 // Name of the graph type, ie Nominal

    // Color
    graphColorField: String,                // Field name on the Y Channel
    graphColorAggregateName: String,        // Aggregation Name on Y Channel, ie Average
    graphColorAggregate: String,            // Aggregation on Y Channel, ie average
    graphColorBin: Boolean,                 // True if channel is binned
    graphColorMaxBins: Number,              // Max nr of ESTIMATED bins
    graphColorFormat: String,               // Format in D3-format
    graphColorImpute: String,               // Calculate missing values based on method/value
    graphColorImputeValue: Number,          // Value if impute = VALUE
    graphColorScheme: String,               // Preselected colour scheme
    graphColorSort: String,                 // Sort order of field
    graphColorStack: String,                // Way that field is stacked, ie Normalised
    graphColorType: String,                 // Graph type, ie nominal
    graphColorTypeName: String,             // Name of the graph type, ie Nominal
    graphColorTimeUnit: String,             // Time unit, ie Year, Month, etc

    // X Axis
    graphXaxisFormat: String,               // Format in D3-format
    graphXaxisGrid: Boolean,                // True if X grid lines show
    graphXaxisGridColorName: String,        // Name of color for X gridlines
    graphXaxisGridColor: String,            // Actual color of X gridline in hex, rgb, etc
    graphXaxisLabels: Boolean,              // True to show X axis labels
    graphXaxisLabelAngle: Number,           // Angle of X axis labels in degrees
    graphXaxisLabelColorName: String,       // Name of color for X labels
    graphXaxisLabelColor: String,           // Actual color of X labels in hex, rgb, etc
    graphXaxisLabelsLength: Number,         // Max length of label text in px
    graphXaxisScaleType: String,            // Type of axis, ie linear, log, etc
    graphXaxisScaleDomainStart: String,     // Start of Scale Domain
    graphXaxisScaleDomainEnd: String,       // End of Scale Domain
    graphXaxisTitle: String,                // Title of X axis
    graphXaxisTitleCheckbox: Boolean,       // True to show axis title

    // Y Axis
    graphYaxisFormat: String,               // Format in D3-format
    graphYaxisGrid: Boolean,                // True to show gridlines
    graphYaxisGridColorName: String,        // Name of color for Y gridlines
    graphYaxisGridColor: String,            // Actual color of Y gridline in hex, rgb, etc
    graphYaxisLabels: Boolean,              // True to show Y axis labels
    graphYaxisLabelAngle: Number,           // Angle of Y axis labels in degrees
    graphYaxisLabelColorName: String,       // Name of color for Y labels
    graphYaxisLabelColor: String,           // Actual color of Y labels in hex, rgb, etc
    graphYaxisLabelsLength: Number,         // Max length of labels in px
    graphYaxisScaleType: String,            // Type of scale, ie Linear, Log, etc
    graphYaxisScaleDomainStart: String,     // Start of Scale Domain
    graphYaxisScaleDomainEnd: String,       // End of Scale Domain
    graphYaxisTitle: String,                // Title of Y axis
    graphYaxisTitleCheckbox: Boolean,       // True to show axis title

    // Legend
    graphLegendAxisScaleType: String,       // Type of Axis, ie Linear, Log, etc
    graphLegendHide: Boolean,               // True to hide the WHOLE Legend
    graphLegendTitleCheckbox: Boolean,      // True to show Legend Title text
    graphLegendTitle: String,               // Title text of the Legend
    graphLegendFormat: String,              // Format in D3-format
    graphLegendLabels: Boolean,             // True to show Legend Labels
    graphLegendLabelColorName: String,      // Name of color for Legend labels
    graphLegendLabelsLength: Number,        // Length of the label in px
    graphLegendLabelColor: String,          // Actual color of Legend labels in hex, rgb, etc

    // Size
    graphSizeField: String,                 // Field name on the Size Channel
    graphSizeType: String,                  // Graph type, ie nominal
    graphSizeTypeName: String,              // Name of the graph type, ie Nominal
    graphSizeAggregateName: String,         // Aggregation Name on Size Channel, ie Average
    graphSizeAggregate: String,             // Aggregation on Size Channel, ie average
    graphSizeBin: Boolean,                  // True if channel is binned
    graphSizeMaxBins: Number,               // Max nr of ESTIMATED bins

    // Row
    graphRowField: String,                  // Field name on the Row Channel
    graphRowType: String,                   // Graph type, ie nominal
    graphRowTypeName: String,               // Name of the graph type, ie Nominal
    graphRowTitleCheckbox: Boolean,         // False to remove the Row Title
    graphRowTitle: String,                  // User-defined Row Title

    // Column
    graphColumnField: String,               // Field name on the Column Channel
    graphColumnType: String,                // Graph type, ie nominal
    graphColumnTypeName: String,            // Name of the graph type, ie Nominal
    graphColumnTitleCheckbox: Boolean,      // False to remove the Column Title
    graphColumnTitle: String,               // User-defined Column Title

    // Detail
    graphDetailField: String,               // Field name on the Detail channel
    graphDetailType: String,                // Graph type, ie nominal
    graphDetailTypeName: String,            // Name of the graph type, ie Nominal

    // X2
    graphX2Field: String,                   // Field name on the secondary X
    graphX2Type: String,                    // Graph type, ie nominal
    graphX2TypeName: String,                // Name of the graph type, ie Nominal
    graphX2AggregateName: String,           // Aggregation on Secondary X, ie Avg

    // Y2
    graphY2Field: String,                   // Field name on the secondary Y
    graphY2Type: String,                    // Graph type, ie nominal
    graphY2TypeName: String,                // Name of the graph type, ie Nominal
    graphY2AggregateName: String,           // Aggregation on Secondary Y, ie Avg

    // Projection
    graphProjectionType: String,            // Type of geo projection
    graphProjectionFieldLatitude: String,   // Lat of geo projection
    graphProjectionFieldLongitude: String,  // Long of geo projection

    // Condition
    conditionColourName: String,            // Name of Colour when condition met
    conditionColour: String,                // Actual Colour when condition met
    conditionFieldName: String,             // Field to put condition on
    conditionOperator: String,              // Condition Operator
    conditionValue: String,                 // Condition Value
    conditionValueFrom: String,             // Condition From Value
    conditionValueTo: String,               // Condition To Value
})

const SlicerBins = new Schema({
    isSelected: Boolean, 
    name: String, 
    fromValue: Number, 
    toValue: Number
})

const SlicerSelection = new Schema({
    isSelected: Boolean, 
    fieldValue: String 
})

const ShapeBullet = new Schema({
    text: String,                   // Text to show
    linkedTabID: Number,            // Optionally lined TabID
    color: String,                  // Colour of text
    jumpedColor: String             // Colour when jumped
})

// Schema
const WidgetSchema = new Schema({

    // Type
    widgetType: String,                     // Graph, Table, Shape, Slicer
    widgetSubType: String,                  // Type of shape, ie Circle.  NB spelling is case-
                                            // sensitive, and used in Code !!

    // Where W lives
    dashboardID: Number,                    // FK to DashboardID to which widget belongs
    dashboardTabID: Number,                 // FKs to Tabs where the widget lives
    dashboardTabIDs: [ { type: Number } ],  // FKs to Tabs where the widget lives

    // Locking
    isLocked: Boolean,                      // True if this W is temporary locked

    // Identification and Description
    id: Number,                             // Unique ID
    originalID: Number,                     // Original ID from which W was copied
    name: String,                           // Name of Widget
    description: String,                    // Description of Widget
    annotation: String,                     // Optional annotation per W, deeper info about W
    annotationLastUserID: String,           // Last UserID who updated this annotation
    annotationLastUpdated: Date,            // Last date-time this annotation was updated

    // Properties loaded @Runtime
    isLiked: Boolean,                       // @RunTime: True if Widget is liked by me
    isSelected: Boolean,                    // True if W is currently selected
    nrDataQualityIssues: Number,            // Nr of related data Quality issues
    nrComments: Number,                     // Nr of related Comments
    showCheckpoints: Boolean,               // True is use is showing Checkpoints in Presentation Mode
    checkpointIDs: [ { type: Number } ],                // Array of FKs to widgetCheckpoints
    currentCheckpoint: Number,              // Index of current Checkpoint in checkpointIDs
    lastCheckpoint: Number,                 // Index of last Checkpoint in checkpointIDs
    // NB: lastCheckpoint >= 0 is used to test that there are no Checkpoints for a W
    // NB: it is not the ID, but the INDEX
    // NB: So, it must be set to -1 to be meaningful.

    // Links @Runtime
    hyperlinkDashboardID: Number,           // Optional Widget ID to jump to
    hyperlinkDashboardTabID: Number,        // Optional Tab Nr to jump to
    containerStyleID: Number,               // Optional ContainerStyleID that provides formatting

    // Data related
    datasourceID: Number,                   // Specific ID that this W points to.  For a W,

    // this is the dSet that contains its data.  For a Sl, it is the dSet that it filters.
    datasetID: Number,                      // Specific ID that this W points to.  For a W,
    // this is the dSet that contains its data.  For a Sl, it is the dSet that it filters.
    // For a W, -1 = latest dataset of the DS-id.  For now, Sl must have a datsetID <> -1
    data: Object,                              // Optional - can copy rawData into table
    dataFields: [ { type: String } ],                   // Optional - can copy [fieldNames] into table
    dataFieldTypes: [ { type: String } ],               // Optional - can copy [fieldTypes] into table
    dataFieldLengths: [ { type: Number } ],             // Optional - can copy [fieldLengths] into table
    dataschema: [ dataSchemaInterface ],      // Array with fields info, ie name, type, etc
    dataParameters: [ DataParameters ],
    reportID: Number,                       // FK to report (query / data).  -1: dont load any report data
    reportName: String,                     // Report (query) name in Eazl (DS implied)
    rowLimit: Number,                       // 0 = show all, 5 = TOP 5, -3 = BOTTOM 3
    addRestRow: Boolean,                    // True means add a row to  = SUM(rest)
    size: String,                           // Small, Medium, Large ito data loading

    // Container
    containerBackgroundcolor: String,       // Actual colour (CSS name or HEX code)
    containerBackgroundcolorName: String,   // Name - CSS (ie black) or Custome Name (Our company blue)
    containerBorder: String,                // HTML Border def, is 1px solid gray
    containerBorderColourName: String,      // Name - CSS (ie black) or Custome Name (Our company blue)
    containerBorderRadius: String,          // Border radius of container in px
    containerBoxshadow: String,             // HTML shadow def, is 2px 2px gray
    containerFontsize: Number,              // Font size inside container
    containerHeight: Number,                // Height of container in px
    containerLeft: Number,                  // Left of container in px
    containerHasContextMenus: Boolean,      // True to display context menu at top of W
    containerHasTitle: Boolean,             // True to display Title at top of container
    containerTop: Number,                   // Top of container in px
    containerWidth: Number,                 // Width of container in px
    containerZindex: Number,                // Z-index of container

    // Title
    titleText: String,                      // Text, can include HTML & keywords (##today##)
    titleBackgroundColor: String,           // Actual colour (CSS name or HEX code)
    titleBackgroundColorName: String,       // Name - CSS (ie black) or Custome Name (Our company blue)
    titleBorder: String,                    // CSS SPEC, ie 1px solid black
    titleBorderName: String,                // Name - CSS (ie black) or Custome Name (Our company blue)
    titleColor: String,                     // Actual colour (CSS name or HEX code)
    titleColorName: String,                 // Name - CSS (ie black) or Custome Name (Our company blue)
    titleFontsize: Number,                  // in px (for later use)
    titleFontWeight: String,                //   (for later use)
    titleHeight: Number,                    // in px (for later use)
    titleMargin: String,                    // css spec, ie 2px 1px 0px 0px
    titlePadding: String,                   // css spec, ie 2px 1px 0px 0px
    titleTextAlign: String,                 // left, right, center
    titleWidth: Number,                     // in %: 0 means it adapts to container

    // Visual Grammer / plotting library
    // Layout 101: one Widget can have:
    // - 1 visual graph or visualisation that is shown on the form
    // - 1 visual grammar, ie Vega or Vega-Lite.  Later, another plotting library
    // - 1 specification that is rendered - this is recreated and not stored
    // - 1 or more layers, each with:
    //   - graph
    //   - info (x, y, etc) and
    //   -
    visualGrammar: String,                  // Gramar for graphs, default = Vega
    version: Number,                        // Version of visual grammar
    visualGrammarType: String,              // Type, Standard or Custom

    // Graph
    graphBackgroundColorName: String,       // Name of Bg color for graph
    graphBackgroundColor: String,           // Bg color for graph in hex, rgb, etc
    graphBorderColorName: String,           // Name of Border Color Border for graph
    graphBorderColor: String,               // Border Border Color for graph in hex, rgb, etc
    graphHeight: Number,                    // in px
    graphLeft: Number,                      // in px
    graphTop: Number,                       // in px
    graphWidth: Number,                     // in px
    graphDimensionRight: Number,            // Space for legend in px (adds to width)
    graphDimensionLeft: Number,             // Space for x axis in px
    graphDimensionBottom: Number,           // Space for y axis in px
    graphGraphPadding: Number,              // How many px graph is padded
    graphHasSignals: Boolean,               // If graph has signals
    graphFillColor: String,                 // Fill colour of the graph area
    graphHoverColor: String,                //
    graphPanAndZoom: Boolean,               // True if selection = grid, with pan and zoom.  Only applies to single layer graphs
    graphSpecification: Object,             // Vega specification
    graphDescription: String,               // Description of graph for users

    // Data
    graphUrl: String,                       // URL of data
    graphData: Object,                      // Actual data as an Array

    // Title
    graphTitleText: String,                 // Text to show in Title
    graphTitleAnchor: String,               // Alignment of text: start, middle, end
    graphTitleAngle: Number,                // Angle of title text in degrees, default is 0
    graphTitleBaseline: String,             // Top, Middel, Bottom of Title relative to graph
    graphTitleColorName: String,            // Name of colour of Text
    graphTitleColor: String,                // Actual text colour in HEX
    graphTitleFont: String,                 // Font name of text
    graphTitleFontSize: Number,             // Size of text font
    graphTitleFontWeight: Number,           // Weight, 100, 200 ... 900
    graphTitleLength: Number,               // Max length, rest with ellipses
    graphTitleOrientation: String,          // Postion of text Top, Right, Bottm, Left

    // Transformation: Overall Array for later user when many different types and sequences
    graphTransformations: [ GraphTransformations ],

    // Calculations
    graphCalculations: [ GraphCalculation ],  // Array of calculations

    // Transformations: Filter
    graphFilters: [ GraphFilter ],            // Array of filters
    sampleNumberRows: Number,               // Random rows to sample EACH time, 0 means all rows

    // Layers
    graphLayerFacet: String,                // Facet: Single, Layer, Hconcet, Vconcat
    graphLayers: [ WidgetGraphSpecification ], // Info and optional spec for each Layer

    // Table - to be determined later ...
    tableBackgroundColor: String,           // Actual colour (CSS name or HEX code)
    tableBackgroundColorName: String,       // Name - CSS (ie black) or Custome Name (Our company blue)
    tableColor: String,                     // Actual colour (CSS name or HEX code)
    tableColorName: String,                 // Name - CSS (ie black) or Custome Name (Our company blue)
    tableCols: Number,                      // Nr of cols, 0 means all
    fontSize: Number,                       // Font size of text
    tableHeight: Number,                    // in px, cuts of rest if bigger than this
    tableHideHeader: Boolean,               // False to hide the column header row
    tableLeft: Number,                      // in px (for later use)
    tableLineHeight: Number,                // Table Line height (for later use)
    tableRows: Number,                      // Nr of rows in the data, excluding header: 0 means all
    tableTop: Number,                       // in px (for later use)
    tableWidth: Number,                     // in px, cuts of rest if bigger than this (for later use)

    // Slicer
    slicerAddRest: Boolean,                 // True to add everything NOT in slicerSelection
    slicerAddRestValue: Boolean,            // True means add all NOT in Sl
    // 1. All in Sl selected + AddRest = 100% of data)  2. None in Sl + AddRest = Compliment
    slicerBins: [ SlicerBins ],
    slicerColor: String,                    // Text Color
    slicerFieldName: String,                // Name to filter on
    slicerNumberToShow: String,             // Nr fields (values) to show in Slicer - default = All
    slicerSelection: [ SlicerSelection ],
    slicerSortField: String,                // Name of Field to sort Slicer dataset on
    slicerSortFieldOrder: String,           // Sort order for Slicer dataset, Ascending, Descending
    slicerType: String,                     // Type of Slicer, ie List, Bin

    // Shape
    shapeBullet: [ ShapeBullet ],           // Bullets, with info
        
    shapeBulletStyleType: String,           // List marker: disc, circle, square, none
    shapeBulletsOrdered: Boolean,           // True if the list is ordered
    shapeBulletMarginBottom: Number,        // Margin-Top in px
    shapeCorner: Number,                    // Corner size in px, ie 15
    shapeFill: String,                      // Fill / inside (ie of circle, colour of text, etc) in HEX
    shapeFillName: String,                  // Name - CSS (ie black) or Custome Name (Our company blue)
    shapeFontFamily: String,                // Font, ie Aria, Sans Serif
    shapeFontSize: Number,                  // Size of font in px, ie 12
    shapeImageUrl: String,                  // URL of the Image
    shapeIsBold: Boolean,                   // True if text is bold
    shapeIsItalic: Boolean,                 // True if text is italic
    shapeLineHeight: String,                // Line Height: normal, 1.6, 80%
    shapeOpacity: Number,                   // Opacity, between 0 and 1, ie of rectangle
    shapeRotation: Number,                  // Nr of degrees to rotate a Shape
    shapeSize: Number,                      // Size of shape, used in scale(). For now: 0-9
    shapeStroke: String,                    // Colour of line in HEX
    shapeStrokeName: String,                // Name - CSS (ie black) or Custome Name (Our company blue)
    shapeStrokeWidth: String,               // Line thickness in px
    shapeSvgHeight: Number,                 // Height of SVG element
    shapeSvgWidth: Number,                  // Width of SVG element
    shapeText: String,                      // Text in textbox - WITH formula, ie #pagenr
    shapeTextDisplay: String,               // Text in textbox - translated, ie 1
    shapeTextAlign: String,                 // Align text Left, Center, Right
    shapeTextColour: String,                // Text colour in HEX
    shapeTextColourName: String,            // Name - CSS (ie black) or Custome Name (Our company blue)
    shapeValue: String,                     // Value to display

    // Created, updated and refreshed
    refreshMode: String,                    // For later use: Manual, OnOpen, Repeatedly
    refreshFrequency: Number,               // For later use: Nr of seconds if RefreshMode = Repeatedly
    widgetRefreshedOn: String,              // Data Refreshed on
    widgetRefreshedBy: String,              // Date Refreshed by
    widgetCreatedOn: {                            // Date task was created
        type: Date,
        // `Date.now()` returns the current unix timestamp as a Number,        default: Date.now
    },
    widgetCreatedBy: String,                // Created by
    widgetUpdatedOn: Date,                  // Updated on
    widgetUpdatedBy: String,                // Updated by

});

// This pre-hook is called before the information is saved into the database
WidgetSchema.pre('save', function(next) {
    var doc = this;

    // Find in the counters collection, increment and update
    counterModel.findOneAndUpdate(
        {_id: 'widgets.id'},
        {$inc: { seq: 1} },
        { upsert: true, new: true },
        function(error, counter)   {
            if(error) {
                return next(error);
            };

            doc.id = counter.seq;
            next();
        }
    );
});

// Create Model: modelName, schema, collection
const WidgetModel = mongoose.model('widgets', WidgetSchema, 'widgets');

// Export
module.exports = WidgetModel;