var daysInAWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var monthsInYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var curiousity = [
    "Forcing yourself to smile can boost your mood",
    "Smiling can improve your immune system",
    "Smiles and positivity are contagious",
    "Smiling releases neuropeptides that help to fight the stress",
    "It's easier to smile than to frown",
    "Smiles use from 5 to 53 facial muscles",
    "Babies are born with the ability to smile",
    "Smiles can be recognized from 300feet away",
    "There are 2 different types of smiles: Duchene or genuine and non-Duchene or social",
    "If you smile, your neighbors have 34% increased chance of becoming happy",
    "If you are smiling you look more attractive and intelligent",
    "When you smile, a friend living 1 mile can be 25% happier",
    "Happiness can make you live longer and improve your heart healthiness",
    "The hippocampus area of your brain is responsible for happiness",
    "Happiness is maximized at 13.9ºC or 57ºF",
    "Sleep-deprived people only remember around 31% of positive words",
    "A sense of community and celebrations contribute to happiness",
    "Thinking positive will make trials easier to bear",
    "When you were born, you were, for a moment, the youngest person on earth",
    "Cows have best friends and they tend to spend most of their time together",
    "Blind people smile even though they’ve never seen anyone else smile",
    "The Beatles used the word “love” 613 times in their songs",
    "Macaques in Japan use coins to buy vending machine snacks",
    "Kissing burns 2 calories a minute",
    "The animal Quokka, in Australia, is considered the world’s happiest animal",
]

Date.prototype.addDays = function (days) {
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
}

Date.prototype.addMonths = function (months) {
    var dat = new Date(this.valueOf());
    dat.setMonth(dat.getMonth() + months);
    return dat;
}

Date.prototype.addYears = function (years) {
    var dat = new Date(this.valueOf());
    dat.setYear(dat.getYear() + years);
    return dat;
}

/**
 * COLLECT BTN
 * - SetSmiles
 * - Animate
 * - init
 */
var collectBtn = {
    btn: null,

    setSmiles: function () {

        if (user.vibes < 5) {
            this.btn.attr("src", "img/jar-" + user.vibes + ".png");
        } else {
            this.btn.attr("src", "img/jar-5.png");
        }
    },

    animate: function () {
        $(this.btn).addClass("animate");
        this.setSmiles();
    },

    init: function () {

        this.btn = $(".jar-img");
        $(this.btn).on("animationend", function (e) {
            $(".jar-img").removeClass("animate");
            $("#upload").addClass("hide");
            $("#back").removeClass("hide");
        });

        $("#upload").on("click", goodVibes.submitVibe);
        $("#back").on("click", goodVibes.hideFeedback);

    }
}

/**
 * GOODVIBES
 * - SetNewVibe
 * - Encrypt
 * - Decrypt
 */
var goodVibes = {
    vibe: null,
    input: null,
    last: "",
    numOfHistory: 5,

    submitVibe: function () {
        var text = goodVibes.input.val();
        if (text.length > 0) {
            var d = new Date();

            goodVibes.setNewVibe(d, text);

            firebaseManager.uploadToFirebase(goodVibes.vibe);
            user.newVibe();

            collectBtn.animate();
            goodVibes.input.val("");
            goodVibes.showFeedBack();
        }
    },

    setNewVibe: function (d, text) {
        this.vibe = {
            timestamp: d.getTime(),
            weekDay: daysInAWeek[d.getDay()],
            day: d.getDate(),
            month: d.getMonth() + 1,
            monthName: monthsInYear[d.getMonth()],
            year: d.getFullYear(),
            text: this.encrypt(text),
            toCompare: d.getFullYear() + "/" + d.getMonth() + "/" + d.getDate()
        }
    },

    encrypt: function (textToEncrypt) {
        var e = CryptoJS.AES.encrypt(textToEncrypt, user.id);
        return e.toString();
    },

    decrypt: function (textToDecrypt) {
        d = CryptoJS.AES.decrypt(textToDecrypt.toString(), user.id);
        return d.toString(CryptoJS.enc.Utf8);
    },

    showFeedBack: function () {

        this.input.addClass("hide");
        $("#tbt").attr("class", "show");

        $("#upload").off("click", goodVibes.submitVibe);

        if (user.data.length > 0 && false) {
            //show old vibe
            var idx = Math.floor(Math.random() * user.data.length);
            $("#tbt-title").html("Do you remember?");
            $("#tbt-date").html(user.data[idx].weekDay + ", " + user.data[idx].monthName + " " + user.data[idx].day + " of " + user.data[idx].year);
            $("#tbt-text").html(goodVibes.decrypt(user.data[idx].text));

        } else {
            //show curiousity
            var idx = Math.floor(Math.random() * curiousity.length);
            $("#tbt-title").html("Did you know");
            $("#tbt-text").html(curiousity[idx]);
        }
    },

    hideFeedback: function () {
        $("#vibe").attr("class", "center-align");
        $("#tbt").attr("class", "hide");
        $("#back").addClass("hide");
        $("#upload").removeClass("hide");
        $("#upload").on("click", goodVibes.submitVibe);
    },

    showHistory: function () {
        $("#history").css("display", "block")

        $("#history-time").html("Last " + this.last)

        var d = (new Date()).addMonths(-1);
        switch (this.last) {
            case "year": d = (new Date()).addYears(-1);
                break;
            case "week": d = (new Date()).addDays(-1);
                break;
        }
        var lastDate = d.getTime();

        var aux = user.allData.slice(); //Copy array and search for old vibes
        for (let index = 0; index < aux.length; index++) {
            if (aux[index].timestamp < lastDate) {
                aux.splice(index, 1)
            }
        }

        var list = $("#history-list"); //append list
        for (let index = 0; index < this.numOfHistory; index++) {
            const idx = Math.floor(Math.random() * aux.length);

            var date = aux[idx].weekDay + ", " + aux[idx].monthName + " " + aux[idx].day + " of " + aux[idx].year

            var item = $("<li></li>")
            item.append("<p class='date'>" + date + "</p>")
            item.append("<p>" + goodVibes.decrypt(aux[idx].text) + "</p>")

            list.append(item)
            aux.splice(idx, 1)
        }
    },

    hideHistory: function () {
        $("#history").css("display", "none")
        $("#history-list").html("")
    },



    init: function () {
        this.input = $("#vibe");
        this.last = "month"
    }
}


/**
 * keyboard
 * - appendCharacter
 * - autosize
 * - init
 */
var keyboard = {
    appendCharacter: function (c) {
        switch (c) {
            case 8: // Backspace
                goodVibes.input.val(goodVibes.input.val().slice(0, -1));
                break;
            default:
                goodVibes.input.val(goodVibes.input.val() + String.fromCharCode(c));
        }
    },

    autosize: function () {
        setTimeout(function () {
            goodVibes.input.css("height", "100px").css("padding", "0");
            if (goodVibes.input.val().length > 0) {
                goodVibes.input.css("height", goodVibes.input.scrollHeight + "px");
            }
        }, 0);
    },

    keydownEvent: function (e) {
        if (!$(goodVibes.input).is(":focus")) {
            switch (e.keyCode) {
                case 8: // Backspace
                    e.preventDefault(); // Stops the backspace key from acting like the back button.
                    keyboard.appendCharacter(e.keyCode);
                    break;
                case 13:
                    e.preventDefault();
                    goodVibes.submitVibe();
                    break;
            }
        }
    },

    keypressEvent: function (e) {
        if (!$(goodVibes.input).is(":focus")) {
            keyboard.appendCharacter(e.keyCode);
        }
    },

    init: function () {
        $(goodVibes.input).on("keydown", function (e) {
            keyboard.autosize();
        })
        $(window).on('keydown', this.keydownEvent);
        $(window).on('keypress', this.keypressEvent);

    }
}