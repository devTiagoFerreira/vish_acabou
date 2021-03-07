exports.firstLetterToUpperCase = (letter) => {
    letter = letter.toLowerCase().split(' ');
    let word = '';
    for (var i = 0; i < letter.length; i++) {
        if (i < letter.length - 1) {
            word += letter[i].charAt(0).toUpperCase() + letter[i].substr(1) + ' ';
        } else {
            word += letter[i].charAt(0).toUpperCase() + letter[i].substr(1);
        }
    }
    return word;
};
