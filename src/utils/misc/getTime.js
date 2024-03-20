/**
 *
 * @param {Date} date Date
 * @returns {string}
 */
function getTime(date) {
	let hours = date.getHours();

	let minutes = date.getMinutes();

	const ampm = hours >= 12 ? 'PM' : 'AM';

	hours %= 12;
	hours = hours || 12;
	minutes = minutes < 10 ? `0${minutes}` : minutes;

	return `${date.toLocaleDateString()} ${hours}:${minutes} ${ampm}`;
}

module.exports = getTime;
