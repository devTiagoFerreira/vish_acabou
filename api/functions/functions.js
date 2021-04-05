//Validador de CNJP
exports.cnpjValidator = (cnpj) => {
    const keys_one = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    if (cnpj.length != 14) {
        return false;
    } else {
        let digit_one = 0;
        for (let i = 1; i < keys_one.length; i++) {
            digit_one += cnpj[i - 1] * keys_one[i];
        }
        digit_one = digit_one % 11;

        if (digit_one < 2) {
            digit_one = 0;
        } else {
            digit_one = 11 - digit_one;
        }

        if (cnpj[12] != digit_one) {
            return false;
        } else {
            let digit_two = 0;
            for (let i = 0; i < keys_one.length; i++) {
                digit_two += cnpj[i] * keys_one[i];
            }
            digit_two = digit_two % 11;

            if (digit_two < 2) {
                digit_two = 0;
            } else {
                digit_two = 11 - digit_two;
            }
            if (cnpj[13] != digit_two) {
                return false;
            } else {
                return true;
            }
        }
    }
};

//Validador de IE
exports.ieValidator = (ie) => {
    if (ie.length != 12) {
        return false;
    } else {
        const keys_one = [1, 3, 4, 5, 6, 7, 8, 10];
        let digit_one = 0;
        for (let i = 0; i < keys_one.length; i++) {
            digit_one += ie[i] * keys_one[i];
        }
        digit_one = digit_one % 11;
        digit_one = digit_one.toString();
        digit_one = digit_one[digit_one.length - 1];

        if (ie[8] != digit_one) {
            return false;
        } else {
            const keys_two = [3, 2, 10, 9, 8, 7, 6, 5, 4, 3, 2];
            let digit_two = 0;
            for (let i = 0; i < keys_two.length; i++) {
                digit_two += ie[i] * keys_two[i];
            }
            digit_two = digit_two % 11;
            digit_two = digit_two.toString();
            digit_two = digit_two[digit_two.length - 1];
            if (ie[11] != digit_two) {
                return false;
            } else {
                return true;
            }
        }
    }
};

//Validador de  e-mail
exports.emailValidator = (email) => {
    const emailValido = email.indexOf('@') > -1;
    return emailValido;
};

//Verificador de contatos
exports.verificaSeContatoExiste = (contatos = {}) => {
    let contato = {};
    for (let i = 0; i < Object.keys(contatos).length; i++) {
        let whatsapp = contatos[Object.keys(contatos)[i]].whatsapp || false
        if (contatos[Object.keys(contatos)[i]].numero) {
            contato[Object.keys(contatos)[i]] = {numero: contatos[Object.keys(contatos)[i]].numero, whatsapp: whatsapp};
        }
    }
    return contato;
};
