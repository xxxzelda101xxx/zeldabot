function getUsers() {
	$.ajax({
		url: "/get_users",
		type: "GET",
		contentType: "application/json",
		success: function(data) {
			$("#usersInChat").text("Users in chat: " + data.total)
		},
		error: function(error) {
			console.log(data)
		}
	})
	setTimeout(function() {
		getUsers()
	}, 60000)
}