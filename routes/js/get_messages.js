function getMessages() {
	$.ajax({
		url: "/get_messages",
		type: "GET",
		contentType: "application/json",
		success: function(data) {
			$("#totalMessages").text("Total messages: " + data.totalMessages)
			$("#totalMessagesThisSession").text("Total messages this session: " + data.totalMessagesThisSession)
		},
		error: function(error) {
			console.log(data)
		}
	})
	setTimeout(function() {
		getMessages()
	}, 1000)
}