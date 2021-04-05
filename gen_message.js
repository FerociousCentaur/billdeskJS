const CryptoJS = require('crypto-js');


class Message {

    constructor(MID, SEC_ID, CHECKSUM_KEY, REVERSE_URL) {
        this.mid = MID;
        this.sec_id = SEC_ID;
        //this.bill_url = BILL_URL;
        //this.conf_bill_url = CONF_BILL_URL;
        this.checksum_key = CHECKSUM_KEY;
        this.reverse_url = REVERSE_URL;
    }
    padDigits(number, digits) {
        return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
    }
    date() {
        let date = new Date();
        return `${this.padDigits(date.getFullYear(),4)}${this.padDigits(date.getMonth()+1,2)}${this.padDigits(date.getDate(),2)}${this.padDigits(date.getHours(),2)}${this.padDigits(date.getMinutes(),2)}${this.padDigits(date.getSeconds(),2)}`
    }
    findNthOccur(string, ch, N) {
        let occur = 0;
        for (let i = 0; i < string.length; i++) {
            if (string[i] === ch) {
                occur += 1
            }
            if (occur === N) {
                return (i);
            }

        }
        return (-1);
    }
    get_mode(s) {
        if (s == '01') {
            return 'Netbanking';
        } else if (s == '02') {
            return 'Credit Card';
        } else if (s == '03') {
            return 'Debit Card';
        } else if (s == '04') {
            return 'Cash Card';
        } else if (s == '05') {
            return 'Mobile Wallet';
        } else if (s == '06') {
            return 'IMPS';
        } else if (s == '07') {
            return 'Reward Points';
        } else if (s == '08') {
            return 'Rupay';
        } else if (s == '09') {
            return 'Others';
        } else if (s == '10') {
            return 'UPI';
        }
    }





    get_checksum(message) {
        let generated_signature = CryptoJS.HmacSHA256(message, this.checksum_key).toString(CryptoJS.enc.Hex).toUpperCase();
        return (generated_signature);
    }

    verify_checksum(message) {
        let l_index = message.lastIndexOf("|");
        let to_be_verified = message.substring(l_index + 1);
        let my_checksum = this.get_checksum(message.substring(0, l_index));
        if (my_checksum === to_be_verified) {
            return true;
        } else {
            return false;
        }

    }

    get_message(uniqueID, amount, some_id, mail, fname, mnumber) {
        let msg = `${this.mid}|${uniqueID}|NA|${amount.toFixed(2)}|NA|NA|NA|INR|NA|R|${this.sec_id}|NA|NA|F|${fname}|${some_id}|${mail}|${mnumber}|NA|NA|NA|${this.reverse_url}`;
        let checksum = this.get_checksum(msg);
        return (msg + '|' + checksum);
    }

    get_schedule_msg(oid) {
        let msg = `0122|${this.mid}|${oid}|${this.date()}`;
        let checksum = this.get_checksum(msg);
        return (msg + '|' + checksum);
    }

    responseMsg(response) {
        let returnArray = {}
        response = response.replace(/[()]/g, '');
        response = response.replace(/[\n]/, '');
        let valid_payment = this.verify_checksum(response)
        if (!valid_payment) {
            return false;
        }

        let pipeind1 = this.findNthOccur(response, '|', 1)
        let pipeind2 = this.findNthOccur(response, '|', 2)
        let pipeind3 = this.findNthOccur(response, '|', 3)
        let pipeind4 = this.findNthOccur(response, '|', 4)
        let pipeind5 = this.findNthOccur(response, '|', 5)
        let pipeind7 = this.findNthOccur(response, '|', 7)
        let pipeind8 = this.findNthOccur(response, '|', 8)
        let pipeind9 = this.findNthOccur(response, '|', 9)
        let pipeind10 = this.findNthOccur(response, '|', 10)
        let pipeind12 = this.findNthOccur(response, '|', 13)
        let pipeind13 = this.findNthOccur(response, '|', 14)
        let pipeind14 = this.findNthOccur(response, '|', 15)
        returnArray.MID = response.substring(0, pipeind1);
        returnArray.OrderID = response.substring(pipeind1 + 1, pipeind2);
        returnArray.TaxnNo = response.substring(pipeind2 + 1, pipeind3);
        returnArray.AMNT = response.substring(pipeind4 + 1, pipeind5);
        returnArray.TStat = response.substring(pipeind13 + 1, pipeind14);
        returnArray.DnT = response.substring(pipeind12 + 1, pipeind13);
        returnArray.TMode = this.get_mode(response.substring(pipeind7 + 1, pipeind8));
        //returnArray.mode = this.get_mode(mode)
        return returnArray;
    }

    scheduleResp(response) {
        let returnArray = {}
        valid_payment = this.verify_checksum(response);
        if (!valid_payment) {
            return false;
        }
        let pipeind1 = this.findNthOccur(response, '|', 1);
        let pipeind2 = this.findNthOccur(response, '|', 2);
        let pipeind3 = this.findNthOccur(response, '|', 3);
        let pipeind4 = this.findNthOccur(response, '|', 4);
        let pipeind15 = this.findNthOccur(response, '|', 15);
        let pipeind16 = this.findNthOccur(response, '|', 16);
        let pipeind27 = this.findNthOccur(response, '|', 27);
        let pipeind28 = this.findNthOccur(response, '|', 28);
        let pipeind29 = this.findNthOccur(response, '|', 29);
        let pipeind31 = this.findNthOccur(response, '|', 31);
        let pipeind32 = this.findNthOccur(response, '|', 32);
        returnArray.MID = response.substring(pipeind1 + 1, pipeind2);
        returnArray.TaxnNo = response.substring(pipeind3 + 1, pipeind4);
        returnArray.OrderID = response.substring(pipeind2 + 1, pipeind3);
        returnArray.status = response.substring(pipeind31 + 1, pipeind32);
        returnArray.TStat = response.substring(pipeind15 + 1, pipeind16);
        returnArray.RfndStat = response.substring(pipeind28 + 1, pipeind29);
        returnArray.AMNT = response.substring(pipeind27 + 1, pipeind28);
        return returnArray;
    }


}