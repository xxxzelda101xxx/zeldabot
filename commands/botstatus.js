import process from "process"

export default {
	name: "botstatus",
	aliases: [],
	description: "",
	canWhisper: false,
	adminOnly: true, 
	isPublic: false,
	isOsuCommand: false,
	execute: async function(msg, context, args) {
		let ut_sec = process.uptime()
		let ut_min = ut_sec / 60
		let ut_hour = ut_min / 60
		let ut_day = ut_hour / 24
		
		ut_sec = Math.floor(ut_sec)
		ut_min = Math.floor(ut_min)
		ut_hour = Math.floor(ut_hour)
		
		ut_day = ut_hour % 24
		ut_hour = ut_hour % 60
		ut_min = ut_min % 60
		ut_sec = ut_sec % 60
		
		return uptime = "Up time: " + ut_day + " Day(s) " + ut_hour + " Hour(s) " + ut_min + " minute(s) and " + ut_sec + " second(s)"
	}
}