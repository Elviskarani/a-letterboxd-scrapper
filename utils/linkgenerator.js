function generateLetterboxdLink(username) {
    const baseUrl = "https://letterboxd.com/";
    const filmsPath = "/films/";
    return `${baseUrl}${username}${filmsPath}`;
}

module.exports = { generateLetterboxdLink };