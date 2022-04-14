function joinChannel() {
	var channel = $("#channelToJoin").val()
	$.ajax({
		url: "/join_channel",
		type: "POST",
		contentType: "application/json",
		data: JSON.stringify({ channel: channel }),
		success: function(data) {
			$("#textToUpdate").text(data.message)
		},
		error: function(error) {
			$("#textToUpdate").text(error.responseJSON.error)
		}
	})
}