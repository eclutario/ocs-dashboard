  /**
 * A google.visualization.Query Wrapper. Sends a
 * query and draws the visualization with the returned data or outputs an
 * error message.
 *
 * DISCLAIMER: This is an example code which you can copy and change as
 * required. It is used with the google visualization API which is assumed to
 * be loaded to the page. For more info see:
 * https://developers.google.com/chart/interactive/docs/reference#Query
 */


/**
 * Constructs a new query wrapper with the given query, visualization,
 * visualization options, and error message container. The visualization
 * should support the draw(dataTable, options) method.
 * @constructor
 */
var QueryWrapper = function(query, visualization, visOptions, errorContainer, isDashboard) {

  this.query = query;
  this.visualization = visualization;
  this.options = visOptions || {};
  this.errorContainer = errorContainer;
  this.currentDataTable = null;
  this.isDashboard = isDashboard;

  if (!visualization || !('draw' in visualization) ||
	  (typeof(visualization['draw']) != 'function')) {
	throw Error('Visualization must have a draw method.');
  }
};


/** Draws the last returned data table, if no data table exists, does nothing.*/
QueryWrapper.prototype.draw = function() {
  if (!this.currentDataTable) {
	return;
  }
  this.visualization.draw(this.currentDataTable, this.options);
};

QueryWrapper.prototype.DrawDashboard = function (dashboardContainer,filter) {
	if (!this.currentDataTable) {
		return;
	}
	new google.visualization.Dashboard(dashboardContainer).
	bind(filter, this.visualization).
	draw(this.currentDataTable, this.options);
};
/**
 * Sends the query and upon its return draws the visualization.
 * If the query is set to refresh then the visualization will be drawn upon
 * each refresh.
 */
QueryWrapper.prototype.sendAndDraw = function () {
	var query = this.query;
	var self = this;
	query.send(function (response) { self.handleResponse(response) });
};

/** Handles the query response returned by the data source. */
QueryWrapper.prototype.handleResponse = function(response) {
	this.currentDataTable = null;
	if (response.isError()) {
	  this.handleErrorResponse(response);
	} else {
		this.currentDataTable = response.getDataTable();
		var filters = [];
		// this.draw();
		switch (this.isDashboard) {
			case 'dashboard':
				var categoryFilter = new google.visualization.ControlWrapper({
					'controlType': 'CategoryFilter',
					'containerId': 'control1',
					'options': {
						'filterColumnLabel': 'Donor',
						'ui': {
						  'labelStacking': 'Donor',
						  'allowTyping': false,
						  'allowMultiple': true,
						  'selectedValuesLayout': 'belowStacked'
						}
					},
					'state': { 'selectedValues': ['.','AfricaRice'] }
				});
				filters.push(categoryFilter);
				var alertFilter = new google.visualization.ControlWrapper({
					'controlType': 'CategoryFilter',
					'containerId': 'alertFilter',
					'options': {
						'filterColumnLabel': 'Status',
						'ui': {
						  'labelStacking': 'Status',
						  'allowTyping': false,
						  'allowMultiple': true,
						  'selectedValuesLayout': 'belowStacked'
						}
					}
				});
				filters.push(alertFilter);
				this.DrawDashboard(document.getElementById(this.isDashboard), filters);
				break;
			case 'dashboardAEC':
				var currentDate = new Date();
				var currentMonth = ('0' + (currentDate.getMonth() + 1)).slice(-2);
				var currentPeriod = currentDate.getFullYear() + currentMonth;
				var periodFilter = new google.visualization.ControlWrapper({
					'controlType': 'CategoryFilter',
					'containerId': 'control2',
					'options': {
						'filterColumnLabel': 'Period',
						'ui': {
						  'labelStacking': 'Period',
						  'allowTyping': false,
						  'allowMultiple': true,
						  'selectedValuesLayout': 'belowStacked'
						}
					},
				  'state': { 'selectedValues': ['201408'] }
				});
				filters.push(periodFilter);
				this.DrawDashboard(document.getElementById(this.isDashboard), filters);
				break;
			default:
			  this.draw();
		} 

	}
}

/** Handles a query response error returned by the data source. */
QueryWrapper.prototype.handleErrorResponse = function(response) {
  var message = response.getMessage();
  var detailedMessage = response.getDetailedMessage();
  if (this.errorContainer) {
	google.visualization.errors.addError(this.errorContainer,
		message, detailedMessage, {'showInTooltip': false});
  } else {
	throw Error(message + ' ' + detailedMessage);
  }
};


/** Aborts the sending and drawing. */
QueryWrapper.prototype.abort = function() {
  this.query.abort();
};