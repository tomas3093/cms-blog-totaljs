// https://wiki.totaljs.com/jcomponent/11-components/
MAIN.defaults.fallbackcache = '1 day';

$(document).ready(function() {
	$(document).on('click', '.mainmenu-button', function() {
		$(this).parent().find('nav').toggleClass('mainmenu-visible');
	});
});

window.convertTimestamp = function(timestamp) {
    var d = new Date(timestamp),
        yyyy = d.getFullYear(),
        mm = ('0' + (d.getMonth() + 1)).slice(-2),	// Months are zero based. Add leading 0.
        dd = ('0' + d.getDate()).slice(-2),			// Add leading 0.
        hh = d.getHours(),
        min = ('0' + d.getMinutes()).slice(-2),		// Add leading 0.
        time;

    // ie: 23.02.2018, 08:35
    time = dd + '.' + mm + '.' + yyyy + ', ' + hh + ':' + min;

    return time;
};

// Create POST request
function post(path, params) {
    var method = "post";
    var form = document.createElement("form");

    form.setAttribute("method", method);
    form.setAttribute("action", path);

    for(var key in params) {
        if(params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);

            form.appendChild(hiddenField);
        }
    }

    document.body.appendChild(form);
    form.submit();
}