// delete an intelligence file
// requires: case ID (case sensitive), reason, if the deletion should be posted (if not **administrator**, default to true)
// requires: be authorized to delete the case file (ISD or O5+ only.)

// waits 24 hours before actually deleting the file.
// outputs (in a channel): the time the file will be deleted, who deleted it, why they did