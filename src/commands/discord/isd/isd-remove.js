// delete an intelligence file on a case by its ID. The file will be deleted after 24 hours, and a message will be posted in a channel with the details of the deletion.
// requires: case ID (case sensitive), reason, if the deletion should be posted (if not **administrator**, default to true)
// requires: be authorized to delete the case file (ISD or O5+ only.)
// waits 24 hours before actually deleting the file.
// outputs (in a channel): the time the file will be deleted, who deleted it, why they did so.
// SHOULD BE ABLE TO WAIT WHILE WORKING FOR OTHER COMMANDS. USE A TIMER OR SOMETHING. MAYBE A DATABASE ENTRY WITH THE DELETION TIME AND A BACKGROUND TASK TO CHECK FOR DELETIONS?
console.log('isd-remove.js was loaded but has no code.');