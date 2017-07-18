var initGarage = function(){
	/**
     * Set Global Variables
     */
	var hourlyPrice = "2.99",
	    firstHourFree = false,
	    overDue = false,
	    overHour = "red",
	    underHour = "blue",
	    headingLabels = ['License Plate', 'Price', 'Duration', 'Entrance Time', 'Exit Time'],
	    addStyle = "";
	    currentPromotionHours = "";
	    containerDiv = document.getElementById('parking-garage');

	var garageFunctions = {
		retrieveData: function() {
			/**
		     * Hit the API to retrieve our list of data
		     */
			var request = new XMLHttpRequest();
			request.open('GET', '/api/event', true);

			request.onload = function() {
			  if (request.status >= 200 && request.status < 400) {
			    // Success!
			    var data = JSON.parse(request.responseText);
			    // Let's build this sucka
			    // SORT DESCENDING BY EXIT TIME

			    var sortedData = garageFunctions.sortDescending(data);
			    //console.log(sortedData);
			    
			    /**
			     * Start building Table
			     * Loop through global variable to create headings for the table
			     * Fill in cells with the data we just received
			     * NOTE: We should paginate these entries due to large input size
			     */

			    garageFunctions.buildTableHeadings(headingLabels);
			    garageFunctions.buildSortedTable(sortedData);
			  } else {
			    alert("Error, Please try again in a few minutes.")
			  }
			};

			request.onerror = function() {
			  alert("Error, please contact your network administrator.")
			  // There was a connection error of some sort
			};

			request.send();
		},

		sortDescending: function(data){
			// Run our sort
			var sorted = data.sort((a, b) => b.out - a.out);				
			return sorted;
		},
		buildTableHeadings: function(headingLabels){
			containerDiv.innerHTML += "<thead><tr>";
			var headingCells = "";
			for (i = 0; i < headingLabels.length; i++) { 
			    headingCells += "<th class='mdl-data-table__cell--non-numeric'>" + headingLabels[i] + "</th>";
			};
			containerDiv.innerHTML += headingCells;
			containerDiv.innerHTML += "</thead></tr>";

		},
		buildSortedTable: function(sortedData){
			// We need to get the difference of the in and out
			// This is our duration of their stay
			// If Duration exeeds 1 hours then we start charging 2.99 per hour.
			containerDiv.innerHTML += '<tbody>';
			Object.keys(sortedData).forEach(function(key) {
				var carEntranceTime = sortedData[key].in, // in
				 carExitTime = sortedData[key].out, // out
				 carDuration = timeFunctions.getDiffTime(carEntranceTime, carExitTime); // diff
				 carLicensePlate = sortedData[key].license, // license

				 // CONVERTED VALUES
				 convertedCarEntranceTime = timeFunctions.getDateTime(carEntranceTime);
				 convertedCarExitTime = timeFunctions.getDateTime(carExitTime);
				 convertedCarDuration = timeFunctions.convertDurationToValues(carDuration);
				 carPriceToBeCharged = timeFunctions.getPrice(convertedCarDuration[2]);
				// carChargePrice = garageFunctions.getPricing(carDuration),

				if(currentPromotionHours == ""){
					if(convertedCarDuration[1] <= 60){
						firstHourFree = true;
						// Do not charge them
					} else {
						firstHourFree = false;
						// We can charge them
						/* Let's check if they are over 24 hours though while we are at it
						*/
						if(convertedCarDuration[1] >= 1440){
							/* Woah man, you have been parked here for 24hours + */
							addStyle = overHour;
						}
					}
				} else {
					// DO PROMOTION MATH HERE
					freeMinutes = currentPromotionHours * 60;
					if(convertedCarDuration[1] <= freeMinutes){
						firstHourFree = true;
						// Do not charge them
					} else {
						firstHourFree = false;
						// We can charge them
						/* Let's check if they are over 24 hours though while we are at it
						*/
						if(convertedCarDuration[1] >= 1440){
							/* Woah man, you have been parked here for 24hours + */
							addStyle = overHour;
						}
					}
				}
				
				 if(firstHourFree){
				 	var addStyle = underHour;
				 	var chargeButton = '<button class="mdl-button mdl-js-button mdl-button--raised" disabled>Charge</button>';
				 } else {
				 	var chargeButton = '<button class="mdl-button mdl-js-button mdl-button--raised">Charge</button>'
				 }
				 containerDiv.innerHTML += '<tr class="' + addStyle + '">' +
				  
				  '<td class="mdl-data-table__cell--non-numeric">' + carLicensePlate + '</td>' +
				  '<td>' + carPriceToBeCharged + '</td>' +
				  '<td>' + convertedCarDuration[2] + '</td>' +
				  '<td>' + convertedCarEntranceTime + '</td>' +
				  '<td>' + convertedCarExitTime + '</td>' +
				  '<td>' + chargeButton + '</td' +
				  '</tr>';

				 firstHourFree = false;
				 overDue = false;
			});
			containerDiv.innerHTML += '</tbody>';
			document.getElementById('preloader').style.display = "none";
		},

		init: function() {
			garageFunctions.retrieveData();
		},
	};

	var timeFunctions = {
		getDateTime: function(time){
			/* 
			// Return time in proper format using MOMENT.js
			*/
			return moment(time).format('MMMM Do YYYY, h:mm:ss a');
		},
		getDiffTime: function(entrance, exit){
			return exit - entrance;
		},
		convertDurationToValues: function(time){
			var timeDifference = time;
		    var differenceDate = new Date(timeDifference);
		    var diffHours = differenceDate.getUTCHours();
		    var diffMinutes = differenceDate.getUTCMinutes();

		    var totalMinutes = diffHours * 60 + diffMinutes;
		    //var diffSeconds = differenceDate.getUTCSeconds();
		    var readableDifference = diffHours + ':' + diffMinutes;
		    var decimalConversion = moment.duration(readableDifference).asHours().toFixed(2);
		    return [readableDifference, totalMinutes, decimalConversion];
		},
		getPrice: function(decimal){
			if(decimal >= 1){
				adjustedRate = decimal - 1;
				chargeRate = "$" + (hourlyPrice * adjustedRate).toFixed(2);
			} else {
				/* Not enough time to start charging // FREE */
				chargeRate = "$0.00"
			}
			return chargeRate;
		}
	};

	garageFunctions.init();
}

initGarage();