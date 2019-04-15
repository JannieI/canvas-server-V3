#!/bin/bash

echo "Dump all the collections to ... (/home/jannie/Projects/canvas-server/data/Dump-2019-04-15/)"

echo "Starting dumping DATA to home/jannie/Projects/canvas-server/data/Dump-2019-04-15/"
echo "---------------------------------------------------------------------------------"
echo ""

echo "Starting dumping data from canvasBackgroundcolors"
mongoexport --db Canvas --collection canvasBackgroundcolors --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/canvasBackgroundcolors.json --jsonArray --pretty

echo "Starting dumping data from canvasBackgroundcolorsDefault"
mongoexport --db Canvas --collection canvasBackgroundcolorsDefault --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/canvasBackgroundcolorsDefault.json --jsonArray --pretty

echo "Starting dumping data from canvasComments"
mongoexport --db Canvas --collection canvasComments --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/canvasComments.json --jsonArray --pretty

echo "Starting dumping data from canvasGroups"
mongoexport --db Canvas --collection canvasGroups --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/canvasGroups.json --jsonArray --pretty

echo "Starting dumping data from canvasMessages"
mongoexport --db Canvas --collection canvasMessages --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/canvasMessages.json --jsonArray --pretty

echo "Starting dumping data from canvasSettings"
mongoexport --db Canvas --collection canvasSettings --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/canvasSettings.json --jsonArray --pretty

echo "Starting dumping data from canvasTasks"
mongoexport --db Canvas --collection canvasTasks --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/canvasTasks.json --jsonArray --pretty

echo "Starting dumping data from canvasUsers"
mongoexport --db Canvas --collection canvasUsers --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/canvasUsers.json --jsonArray --pretty

echo "Starting dumping data from clientData"
mongoexport --db Canvas --collection clientData --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/clientData.json --jsonArray --pretty

echo "Starting dumping data from containerStyles"
mongoexport --db Canvas --collection containerStyles --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/containerStyles.json --jsonArray --pretty

echo "Starting dumping data from counters"
mongoexport --db Canvas --collection counters --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/counters.json --jsonArray --pretty

echo "Starting dumping data from dashboardLayouts"
mongoexport --db Canvas --collection dashboardLayouts --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/dashboardLayouts.json --jsonArray --pretty

echo "Starting dumping data from dashboardPermissions"
mongoexport --db Canvas --collection dashboardPermissions --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/dashboardPermissions.json --jsonArray --pretty

echo "Starting dumping data from dashboardScheduleLog"
mongoexport --db Canvas --collection dashboardScheduleLog --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/dashboardScheduleLog.json --jsonArray --pretty

echo "Starting dumping data from dashboardSchedules"
mongoexport --db Canvas --collection dashboardSchedules --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/dashboardSchedules.json --jsonArray --pretty

echo "Starting dumping data from dashboardSnapshots"
mongoexport --db Canvas --collection dashboardSnapshots --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/dashboardSnapshots.json --jsonArray --pretty

echo "Starting dumping data from dashboardSubscriptions"
mongoexport --db Canvas --collection dashboardSubscriptions --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/dashboardSubscriptions.json --jsonArray --pretty

echo "Starting dumping data from dashboardTabs"
mongoexport --db Canvas --collection dashboardTabs --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/dashboardTabs.json --jsonArray --pretty

echo "Starting dumping data from dashboardTags"
mongoexport --db Canvas --collection dashboardTags --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/dashboardTags.json --jsonArray --pretty

echo "Starting dumping data from dashboardThemes"
mongoexport --db Canvas --collection dashboardThemes --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/dashboardThemes.json --jsonArray --pretty

echo "Starting dumping data from dashboards"
mongoexport --db Canvas --collection dashboards --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/dashboards.json --jsonArray --pretty

echo "Starting dumping data from dashboardsRecent"
mongoexport --db Canvas --collection dashboardsRecent --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/dashboardsRecent.json --jsonArray --pretty

echo "Starting dumping data from dataCachingTable"
mongoexport --db Canvas --collection dataCachingTable --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/dataCachingTable.json --jsonArray --pretty

echo "Starting dumping data from dataConnections"
mongoexport --db Canvas --collection dataConnections --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/dataConnections.json --jsonArray --pretty

echo "Starting dumping data from dataOwnerships"
mongoexport --db Canvas --collection dataOwnerships --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/dataOwnerships.json --jsonArray --pretty

echo "Starting dumping data from dataQualityIssues"
mongoexport --db Canvas --collection dataQualityIssues --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/dataQualityIssues.json --jsonArray --pretty

echo "Starting dumping data from datasourceHistory"
mongoexport --db Canvas --collection datasourceHistory --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/datasourceHistory.json --jsonArray --pretty

echo "Starting dumping data from datasourcePermissions"
mongoexport --db Canvas --collection datasourcePermissions --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/datasourcePermissions.json --jsonArray --pretty

echo "Starting dumping data from datasourceScheduleLogs"
mongoexport --db Canvas --collection datasourceScheduleLogs --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/datasourceScheduleLogs.json --jsonArray --pretty

echo "Starting dumping data from datasourceSchedules"
mongoexport --db Canvas --collection datasourceSchedules --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/datasourceSchedules.json --jsonArray --pretty

echo "Starting dumping data from datasourceTransformations"
mongoexport --db Canvas --collection datasourceTransformations --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/datasourceTransformations.json --jsonArray --pretty

echo "Starting dumping data from datasourcefilters"
mongoexport --db Canvas --collection datasourcefilters --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/datasourcefilters.json --jsonArray --pretty

echo "Starting dumping data from datasources"
mongoexport --db Canvas --collection datasources --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/datasources.json --jsonArray --pretty

echo "Starting dumping data from paletteButtonBars"
mongoexport --db Canvas --collection paletteButtonBars --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/paletteButtonBars.json --jsonArray --pretty

echo "Starting dumping data from paletteButtonsSelecteds"
mongoexport --db Canvas --collection paletteButtonsSelecteds --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/paletteButtonsSelecteds.json --jsonArray --pretty

echo "Starting dumping data from statusBarMessageLogs"
mongoexport --db Canvas --collection statusBarMessageLogs --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/statusBarMessageLogs.json --jsonArray --pretty

echo "Starting dumping data from transformations"
mongoexport --db Canvas --collection transformations --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/transformations.json --jsonArray --pretty

echo "Starting dumping data from userpreferences"
mongoexport --db Canvas --collection userpreferences --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/userpreferences.json --jsonArray --pretty

echo "Starting dumping data from widgetCheckpoints"
mongoexport --db Canvas --collection widgetCheckpoints --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/widgetCheckpoints.json --jsonArray --pretty

echo "Starting dumping data from widgetGraphs"
mongoexport --db Canvas --collection widgetGraphs --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/widgetGraphs.json --jsonArray --pretty

echo "Starting dumping data from widgetLayouts"
mongoexport --db Canvas --collection widgetLayouts --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/widgetLayouts.json --jsonArray --pretty

echo "Starting dumping data from widgetStoredTemplates"
mongoexport --db Canvas --collection widgetStoredTemplates --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/widgetStoredTemplates.json --jsonArray --pretty

echo "Starting dumping data from widgets"
mongoexport --db Canvas --collection widgets --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/widgets.json --jsonArray --pretty

echo "Starting dumping data from widgetstoredtemplates"
mongoexport --db Canvas --collection widgetstoredtemplates --out /home/jannie/Projects/canvas-server/data/Dump-2019-04-15/widgetstoredtemplates.json --jsonArray --pretty

