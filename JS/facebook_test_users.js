function bookmark() {
    if (window.sidebar && window.sidebar.addPanel) { // Mozilla Firefox Bookmark
    	window.sidebar.addPanel(document.title,window.location.href,'');
    } else if(window.external && ('AddFavorite' in window.external)) { // IE Favorite
    	window.external.AddFavorite(location.href,document.title); 
    } else if(window.opera && window.print) { // Opera Hotlist
    	this.title=document.title;
    	return true;
    } else { // webkit - safari/chrome
    	alert('Press ' + (navigator.userAgent.toLowerCase().indexOf('mac') != - 1 ? 'Command/Cmd' : 'CTRL') + ' + D to bookmark this page.');
    }
}

function getParameterByKeyFromQueryString(key, queryString) {
	key = key.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + key + "=([^&#]*)"),
	results = regex.exec(queryString);
	return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function showTestUsers(facebookAppID, facebookAppSecret, isMobile) {
	var appAccessTokenQueryParams =  {"client_id" : facebookAppID, "client_secret" : facebookAppSecret, "grant_type" : "client_credentials"};

	$.ajax({
		type: "GET",
		url: "https://graph.facebook.com/oauth/access_token",
		data: appAccessTokenQueryParams
	}).done(function(data) {
		var appAccessToken = getParameterByKeyFromQueryString("access_token", "?" + data);

		var testUserQueryParams =  {"access_token" : appAccessToken};

		$.getJSON('https://graph.facebook.com/' + facebookAppID + '/accounts/test-users', testUserQueryParams, function(data) {
			var testUserArray = data["data"];
			// var lastTestUser = $(testUserArray).last()[0];
			var linkItemArray = [];

			$.each(testUserArray, function(idx, obj){ 
				var testUserId = obj["id"];

				$.getJSON("https://graph.facebook.com/" + testUserId, testUserQueryParams, function(data) {
					var email = data["email"];
					var testUserName = data["name"];
					var baseURL = isMobile ? 'https://m.facebook.com/login.php' : 'https://facebook.com/login.php'; 
					var linkItem = $('<li><p><a href="' + baseURL + '?' + $.param({ "email" : email}) + '">Log in as ' + testUserName + '</a>&nbsp;&nbsp;(<span class="copyText">' + email + '</span>)</p></li>');
					linkItem.data("name" , testUserName);
					linkItemArray.push(linkItem);

					if (testUserArray.length == linkItemArray.length) {						
						linkItemArray.sort(function(a, b) {
							var aName = $(a).data("name");
							var bName = $(b).data("name");

							return aName.localeCompare(bName);
						});

						var bookMarkLink = $('<a href="#" rel="sidebar" title="bookmark this page">Bookmark This Page</a>');
						bookMarkLink.click(function () {
							bookmark();
						});
						$('#main-container').append(bookMarkLink);
						$('#main-container').append($('<br /><br />'));



						var orderedList = $("<ol>");
						orderedList.append(linkItemArray);						
						$('#main-container').append(orderedList);

						$('.copyText').click(function() {
							if ($('#tmp').length) {
								$('#tmp').remove();
							}
							var clickText = $(this).text();
							$('<textarea id="tmp" />')
							.appendTo($(this))
							.val(clickText)
							.focus()
							.select();
							return false;
						});
						$(':not(.copyText)').click(function(){
							$('#tmp').remove();
						});			
					};





					// var formID = testUserId + 'facebookLoginForm';
					// var form = $('<form id="' + formID + '" method="post" action="https://m.facebook.com/login.php">\
					// 	<input type="hidden" name="email" value="' + email + '" />\
					// 	<input type="hidden" name="pass" value="pass" />\
					// 	<input type="hidden" name="lsd" value="' + loginToken + '" />\
					// 	<a onclick="document.getElementById(\'' + formID + '\').submit();">Log in as ' + testUserName + '</a>\
					// 	</form>');
					// form.data("name" , testUserName);

					// $('#main-container').append(form);

					// if (lastTestUser["id"] == testUserId) {
					// 	var list = $("form").get();
					// 	list.sort(function(a, b) {
					// 		var aName = $(a).data("name");
					// 		var bName = $(b).data("name");

					// 		return aName.localeCompare(bName);
					// 	});
					// 	for (var i = 0; i < list.length; i++) {
					// 		list[i].parentNode.appendChild(list[i]);
					// 	}
					// };
				});
			});
		});
	});
}

function showForm() {
	$('#main-container').append($('<body>\
<form name="input" action="" method="get">\
Facebook App ID: <input type="text" name="facebook_app_id" placeholder="required">\
<br />\
Facebook App Secret: <input type="text" name="facebook_app_secret" placeholder="required">\
<br />\
<input type="checkbox" name="is_mobile" value="is_mobile">Is Mobile\
<br />\
<input type="submit" value="Submit">\
</form>\
</body>'));
}

$(document).ready(function () {
		// var loginToken = getParameterByName("login_token");
		// if (!loginToken) {
		// 	alert('Missing "login_token" query parameter!');
		// 	return;
		// };
		
		var facebookAppID = getParameterByName("facebook_app_id");
		var facebookAppSecret = getParameterByName("facebook_app_secret");
		var isMobile = getParameterByName("is_mobile");

		if (facebookAppID && facebookAppSecret) {
			showTestUsers(facebookAppID, facebookAppSecret, isMobile);
		}
		else {
			showForm();			
		}

		
});