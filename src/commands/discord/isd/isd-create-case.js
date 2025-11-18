// create an intelligence file
// requires: user that will be associated w/ file (ID), reason created, security level (0 - 6, 0 lowest, 6 highest), name input
// requires: be SC-4+ or ISD
// SC4 > O5 > OoTA > TA
// ISD
// prints the case ID in the ISD server, with who created the file, who it's on, and why.
// utilizes MongoDB to store the intel
// Scans MongoDB for existing intel files on the user, and if one exists, it appends to it rather than creating a new one

