/*
LNK-TEST-DATA (lnk-test-data.js) - Javascript code for this CapLnk component.

Copyright (C) 2014 by Gregory J Lamoree

This file is part of the LNK-TEST-DATA component which is part of the
CapLnk (Component - Application - Link) suite of components. 

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
    
    This code is based on chance.js by Victor Quinn and is covered under the MIT license.

    //  Chance.js 0.6.1
    //  http://chancejs.com
    //  (c) 2013 Victor Quinn
    //  Chance may be freely distributed or modified under the MIT license.
    
    
*/

        Polymer('lnk-test-data', {
            /**
           * The `testData` property holds the requested test data.
           * 
           * @attribute author
           * @type string
           * @default 'Gregory J Lamoree'
           */
            testData: '',

            /**
           * Lifecycle Callback Methods
           */
            created: function() {
            },
            ready: function() {
                this.testData = eval("this.chance." + this.type);
            },
            attached: function () {
            },
            domReady: function() {
            },
            detached: function() {
            },
            attributeChanged: function(attrName, oldVal, newVal) {
                //var newVal = this.getAttribute(attrName);
                //console.log(attrName, 'old: ' + oldVal, 'new:', newVal);        
            },
            chance: (function () {

                // Constants
                var MAX_INT = 9007199254740992;
                var MIN_INT = -MAX_INT;
                var NUMBERS = '0123456789';
                var CHARS_LOWER = 'abcdefghijklmnopqrstuvwxyz';
                var CHARS_UPPER = CHARS_LOWER.toUpperCase();
                var HEX_POOL  = NUMBERS + "abcdef";

                // Cached array helpers
                var slice = Array.prototype.slice;

                // Constructor
                function Chance (seed) {
                    if (!(this instanceof Chance)) {
                        return new Chance(seed);
                    }

                    if (seed !== undefined) {
                        // If we were passed a generator rather than a seed, use it.
                        if (typeof seed === 'function') {
                            this.random = seed;
                        } else {
                            this.seed = seed;
                        }
                    }

                    // If no generator function was provided, use our MT
                    if (typeof this.random === 'undefined') {
                        this.mt = this.mersenne_twister(seed);
                        this.random = function () {
                            return this.mt.random(this.seed);
                        };
                    }
                }

                Chance.prototype.VERSION = "0.5.9";

                // Random helper functions
                function initOptions(options, defaults) {
                    options || (options = {});

                    if (defaults) {
                        for (var i in defaults) {
                            if (typeof options[i] === 'undefined') {
                                options[i] = defaults[i];
                            }
                        }
                    }

                    return options;
                }

                function testRange(test, errorMessage) {
                    if (test) {
                        throw new RangeError(errorMessage);
                    }
                }

                // -- Basics --

                Chance.prototype.bool = function (options) {

                    // likelihood of success (true)
                    options = initOptions(options, {likelihood : 50});

                    testRange(
                        options.likelihood < 0 || options.likelihood > 100,
                        "Chance: Likelihood accepts values from 0 to 100."
                    );

                    return this.random() * 100 < options.likelihood;
                };

                Chance.prototype.character = function (options) {
                    options = initOptions(options);

                    var symbols = "!@#$%^&*()[]",
                        letters, pool;

                    testRange(
                        options.alpha && options.symbols,
                        "Chance: Cannot specify both alpha and symbols."
                    );


                    if (options.casing === 'lower') {
                        letters = CHARS_LOWER;
                    } else if (options.casing === 'upper') {
                        letters = CHARS_UPPER;
                    } else {
                        letters = CHARS_LOWER + CHARS_UPPER;
                    }

                    if (options.pool) {
                        pool = options.pool;
                    } else if (options.alpha) {
                        pool = letters;
                    } else if (options.symbols) {
                        pool = symbols;
                    } else {
                        pool = letters + NUMBERS + symbols;
                    }

                    return pool.charAt(this.natural({max: (pool.length - 1)}));
                };

                // Note, wanted to use "float" or "double" but those are both JS reserved words.

                // Note, fixed means N OR LESS digits after the decimal. This because
                // It could be 14.9000 but in JavaScript, when this is cast as a number,
                // the trailing zeroes are dropped. Left to the consumer if trailing zeroes are
                // needed
                Chance.prototype.floating = function (options) {
                    var num;

                    options = initOptions(options, {fixed : 4});
                    var fixed = Math.pow(10, options.fixed);

                    testRange(
                        options.fixed && options.precision,
                        "Chance: Cannot specify both fixed and precision."
                    );

                    var max = MAX_INT / fixed;
                    var min = -max;

                    testRange(
                        options.min && options.fixed && options.min < min,
                        "Chance: Min specified is out of range with fixed. Min should be, at least, " + min
                    );
                    testRange(
                        options.max && options.fixed && options.max > max,
                        "Chance: Max specified is out of range with fixed. Max should be, at most, " + max
                    );

                    options = initOptions(options, {min : min, max : max});

                    // Todo - Make this work!
                    // options.precision = (typeof options.precision !== "undefined") ? options.precision : false;

                    num = this.integer({min: options.min * fixed, max: options.max * fixed});
                    var num_fixed = (num / fixed).toFixed(options.fixed);

                    return parseFloat(num_fixed);
                };

                // NOTE the max and min are INCLUDED in the range. So:
                //
                // chance.natural({min: 1, max: 3});
                //
                // would return either 1, 2, or 3.

                Chance.prototype.integer = function (options) {

                    // 9007199254740992 (2^53) is the max integer number in JavaScript
                    // See: http://vq.io/132sa2j
                    options = initOptions(options, {min: MIN_INT, max: MAX_INT});

                    testRange(options.min > options.max, "Chance: Min cannot be greater than Max.");

                    return Math.floor(this.random() * (options.max - options.min + 1) + options.min);
                };

                Chance.prototype.natural = function (options) {
                    options = initOptions(options, {min: 0, max: MAX_INT});
                    return this.integer(options);
                };

                Chance.prototype.normal = function (options) {
                    options = initOptions(options, {mean : 0, dev : 1});

                    // The Marsaglia Polar method
                    var s, u, v, norm,
                        mean = options.mean,
                        dev = options.dev;

                    do {
                        // U and V are from the uniform distribution on (-1, 1)
                        u = this.random() * 2 - 1;
                        v = this.random() * 2 - 1;

                        s = u * u + v * v;
                    } while (s >= 1);

                    // Compute the standard normal variate
                    norm = u * Math.sqrt(-2 * Math.log(s) / s);

                    // Shape and scale
                    return dev * norm + mean;
                };

                Chance.prototype.string = function (options) {
                    options = initOptions(options);

                    var length = options.length || this.natural({min: 5, max: 20}),
                        pool = options.pool,
                        text = this.n(this.character, length, {pool: pool});

                    return text.join("");
                };

                // -- End Basics --

                // -- Helpers --

                Chance.prototype.capitalize = function (word) {
                    return word.charAt(0).toUpperCase() + word.substr(1);
                };

                Chance.prototype.mixin = function (obj) {
                    for (var func_name in obj) {
                        Chance.prototype[func_name] = obj[func_name];
                    }
                    return this;
                };

                // Given a function that generates something random and a number of items to generate,
                // return an array of items where none repeat.
                Chance.prototype.unique = function(fn, num, options) {
                    options = initOptions(options, {
                        // Default comparator to check that val is not already in arr.
                        // Should return `false` if item not in array, `true` otherwise
                        comparator: function(arr, val) {
                            return arr.indexOf(val) !== -1;
                        }
                    });

                    var arr = [], count = 0, result, MAX_DUPLICATES = num * 50, params = slice.call(arguments, 2);

                    while (arr.length < num) {
                        result = fn.apply(this, params);
                        if (!options.comparator(arr, result)) {
                            arr.push(result);
                            // reset count when unique found
                            count = 0;
                        }

                        if (++count > MAX_DUPLICATES) {
                            throw new RangeError("Chance: num is likely too large for sample set");
                        }
                    }
                    return arr;
                };

                /**
     *  Gives an array of n random terms
     *  @param fn the function that generates something random
     *  @param n number of terms to generate
     *  @param options options for the function fn. 
     *  There can be more parameters after these. All additional parameters are provided to the given function
     */
                Chance.prototype.n = function(fn, n, options) {
                    var i = n || 1, arr = [], params = slice.call(arguments, 2);

                    for (null; i--; null) {
                        arr.push(fn.apply(this, params));
                    }

                    return arr;
                };

                // H/T to SO for this one: http://vq.io/OtUrZ5
                Chance.prototype.pad = function (number, width, pad) {
                    // Default pad to 0 if none provided
                    pad = pad || '0';
                    // Convert number to a string
                    number = number + '';
                    return number.length >= width ? number : new Array(width - number.length + 1).join(pad) + number;
                };

                Chance.prototype.pick = function (arr, count) {
                    if (!count || count === 1) {
                        return arr[this.natural({max: arr.length - 1})];
                    } else {
                        return this.shuffle(arr).slice(0, count);
                    }
                };

                Chance.prototype.shuffle = function (arr) {
                    var old_array = arr.slice(0),
                        new_array = [],
                        j = 0,
                        length = Number(old_array.length);

                    for (var i = 0; i < length; i++) {
                        // Pick a random index from the array
                        j = this.natural({max: old_array.length - 1});
                        // Add it to the new array
                        new_array[i] = old_array[j];
                        // Remove that element from the original array
                        old_array.splice(j, 1);
                    }

                    return new_array;
                };

                // -- End Helpers --

                // -- Text --

                Chance.prototype.paragraph = function (options) {
                    options = initOptions(options);

                    var sentences = options.sentences || this.natural({min: 3, max: 7}),
                        sentence_array = this.n(this.sentence, sentences);

                    return sentence_array.join(' ');
                };

                // Could get smarter about this than generating random words and
                // chaining them together. Such as: http://vq.io/1a5ceOh
                Chance.prototype.sentence = function (options) {
                    options = initOptions(options);

                    var words = options.words || this.natural({min: 12, max: 18}),
                        text, word_array = this.n(this.word, words);

                    text = word_array.join(' ');

                    // Capitalize first letter of sentence, add period at end
                    text = this.capitalize(text) + '.';

                    return text;
                };

                Chance.prototype.syllable = function (options) {
                    options = initOptions(options);

                    var length = options.length || this.natural({min: 2, max: 3}),
                        consonants = 'bcdfghjklmnprstvwz', // consonants except hard to speak ones
                        vowels = 'aeiou', // vowels
                        all = consonants + vowels, // all
                        text = '',
                        chr;

                    // I'm sure there's a more elegant way to do this, but this works
                    // decently well.
                    for (var i = 0; i < length; i++) {
                        if (i === 0) {
                            // First character can be anything
                            chr = this.character({pool: all});
                        } else if (consonants.indexOf(chr) === -1) {
                            // Last character was a vowel, now we want a consonant
                            chr = this.character({pool: consonants});
                        } else {
                            // Last character was a consonant, now we want a vowel
                            chr = this.character({pool: vowels});
                        }

                        text += chr;
                    }

                    return text;
                };

                Chance.prototype.word = function (options) {
                    options = initOptions(options);

                    testRange(
                        options.syllables && options.length,
                        "Chance: Cannot specify both syllables AND length."
                    );

                    var syllables = options.syllables || this.natural({min: 1, max: 3}),
                        text = '';

                    if (options.length) {
                        // Either bound word by length
                        do {
                            text += this.syllable();
                        } while (text.length < options.length);
                        text = text.substring(0, options.length);
                    } else {
                        // Or by number of syllables
                        for (var i = 0; i < syllables; i++) {
                            text += this.syllable();
                        }
                    }
                    return text;
                };

                // -- End Text --

                // -- Person --

                Chance.prototype.age = function (options) {
                    options = initOptions(options);
                    var ageRange;

                    switch (options.type) {
                        case 'child':
                            ageRange = {min: 1, max: 12};
                            break;
                        case 'teen':
                            ageRange = {min: 13, max: 19};
                            break;
                        case 'adult':
                            ageRange = {min: 18, max: 65};
                            break;
                        case 'senior':
                            ageRange = {min: 65, max: 100};
                            break;
                        case 'all':
                            ageRange = {min: 1, max: 100};
                            break;
                        default:
                            ageRange = {min: 18, max: 65};
                            break;
                    }

                    return this.natural(ageRange);
                };

                Chance.prototype.birthday = function (options) {
                    options = initOptions(options, {
                        year: (new Date().getFullYear() - this.age(options))
                    });

                    return this.date(options);
                };


                Chance.prototype.first = function (options) {
                    options = initOptions(options, {gender: this.gender()});
                    return this.pick(this.get("firstNames")[options.gender.toLowerCase()]);
                };

                Chance.prototype.gender = function () {
                    return this.pick(['Male', 'Female']);
                };


                Chance.prototype.last = function () {
                    return this.pick(this.get("lastNames"));
                };

                Chance.prototype.name = function (options) {
                    options = initOptions(options);

                    var first = this.first(options),
                        last = this.last(),
                        name;

                    if (options.middle) {
                        name = first + ' ' + this.first(options) + ' ' + last;
                    } else if (options.middle_initial) {
                        name = first + ' ' + this.character({alpha: true, casing: 'upper'}) + '. ' + last;
                    } else {
                        name = first + ' ' + last;
                    }

                    if (options.prefix) {
                        name = this.prefix(options) + ' ' + name;
                    }

                    return name;
                };

                // Return the list of available name prefixes based on supplied gender.
                Chance.prototype.name_prefixes = function (gender) {
                    gender = gender || "all";

                    var prefixes = [
                        { name: 'Doctor', abbreviation: 'Dr.' }
                    ];

                    if (gender === "male" || gender === "all") {
                        prefixes.push({ name: 'Mister', abbreviation: 'Mr.' });
                    }

                    if (gender === "female" || gender === "all") {
                        prefixes.push({ name: 'Miss', abbreviation: 'Miss' });
                        prefixes.push({ name: 'Misses', abbreviation: 'Mrs.' });
                    }

                    return prefixes;
                };

                // Alias for name_prefix
                Chance.prototype.prefix = function (options) {
                    return this.name_prefix(options);
                };

                Chance.prototype.name_prefix = function (options) {
                    options = initOptions(options, { gender: "all" });
                    return options.full ?
                        this.pick(this.name_prefixes(options.gender)).name :
                    this.pick(this.name_prefixes(options.gender)).abbreviation;
                };

                Chance.prototype.ssn = function (options) {
                    options = initOptions(options, {ssnFour: false, dashes: true});
                    var ssn_pool = "1234567890",
                        ssn,
                        dash = options.dashes ? '-' : '';

                    if(!options.ssnFour) {
                        ssn = this.string({pool: ssn_pool, length: 3}) + dash +
                            this.string({pool: ssn_pool, length: 2}) + dash +
                            this.string({pool: ssn_pool, length: 4});
                    } else {
                        ssn = this.string({pool: ssn_pool, length: 4});
                    }
                    return ssn;
                };

                // -- End Person --

                // -- Web --

                Chance.prototype.color = function (options) {
                    function gray(value, delimiter) {
                        return [value, value, value].join(delimiter || '');
                    }

                    options = initOptions(options, {format: this.pick(['hex', 'shorthex', 'rgb']), grayscale: false});
                    var isGrayscale = options.grayscale;

                    if (options.format === 'hex') {
                        return '#' + (isGrayscale ? gray(this.hash({length: 2})) : this.hash({length: 6}));
                    }

                    if (options.format === 'shorthex') {
                        return '#' + (isGrayscale ? gray(this.hash({length: 1})) : this.hash({length: 3}));
                    }

                    if (options.format === 'rgb') {
                        if (isGrayscale) {
                            return 'rgb(' + gray(this.natural({max: 255}), ',') + ')';
                        } else {
                            return 'rgb(' + this.natural({max: 255}) + ',' + this.natural({max: 255}) + ',' + this.natural({max: 255}) + ')';
                        }
                    }

                    throw new Error('Invalid format provided. Please provide one of "hex", "shorthex", or "rgb"');
                };

                Chance.prototype.domain = function (options) {
                    options = initOptions(options);
                    return this.word() + '.' + (options.tld || this.tld());
                };

                Chance.prototype.email = function (options) {
                    options = initOptions(options);
                    return this.word() + '@' + (options.domain || this.domain());
                };

                Chance.prototype.fbid = function () {
                    return parseInt('10000' + this.natural({max: 100000000000}), 10);
                };

                Chance.prototype.google_analytics = function () {
                    var account = this.pad(this.natural({max: 999999}), 6);
                    var property = this.pad(this.natural({max: 99}), 2);

                    return 'UA-' + account + '-' + property;
                };

                Chance.prototype.hashtag = function () {
                    return '#' + this.word();
                };

                Chance.prototype.ip = function () {
                    // Todo: This could return some reserved IPs. See http://vq.io/137dgYy
                    // this should probably be updated to account for that rare as it may be
                    return this.natural({max: 255}) + '.' +
                        this.natural({max: 255}) + '.' +
                        this.natural({max: 255}) + '.' +
                        this.natural({max: 255});
                };

                Chance.prototype.ipv6 = function () {
                    var ip_addr = this.n(this.hash, 8, {length: 4});

                    return ip_addr.join(":");
                };

                Chance.prototype.klout = function () {
                    return this.natural({min: 1, max: 99});
                };

                Chance.prototype.tlds = function () {
                    return ['com', 'org', 'edu', 'gov', 'co.uk', 'net', 'io'];
                };

                Chance.prototype.tld = function () {
                    return this.pick(this.tlds());
                };

                Chance.prototype.twitter = function () {
                    return '@' + this.word();
                };

                // -- End Web --

                // -- Address --

                Chance.prototype.address = function (options) {
                    options = initOptions(options);
                    return this.natural({min: 5, max: 2000}) + ' ' + this.street(options);
                };

                Chance.prototype.areacode = function (options) {
                    options = initOptions(options, {parens : true});
                    // Don't want area codes to start with 1, or have a 9 as the second digit
                    var areacode = this.natural({min: 2, max: 9}).toString() +
                        this.natural({min: 0, max: 8}).toString() +
                        this.natural({min: 0, max: 9}).toString();

                    return options.parens ? '(' + areacode + ')' : areacode;
                };

                Chance.prototype.city = function () {
                    return this.capitalize(this.word({syllables: 3}));
                };

                Chance.prototype.coordinates = function (options) {
                    options = initOptions(options);
                    return this.latitude(options) + ', ' + this.longitude(options);
                };

                Chance.prototype.geoJson = function (options) {
                    options = initOptions(options);
                    return this.latitude(options) + ', ' + this.longitude(options) + ', ' + this.altitude(options);
                };

                Chance.prototype.altitude = function (options) {
                    options = initOptions(options, {fixed : 5});
                    return this.floating({min: 0, max: 32736000, fixed: options.fixed});
                };

                Chance.prototype.depth = function (options) {
                    options = initOptions(options, {fixed: 5});
                    return this.floating({min: -35994, max: 0, fixed: options.fixed});
                };

                Chance.prototype.latitude = function (options) {
                    options = initOptions(options, {fixed: 5, min: -90, max: 90});
                    return this.floating({min: options.min, max: options.max, fixed: options.fixed});
                };

                Chance.prototype.longitude = function (options) {
                    options = initOptions(options, {fixed: 5, min: -180, max: 180});
                    return this.floating({min: options.min, max: options.max, fixed: options.fixed});
                };

                Chance.prototype.phone = function (options) {
                    options = initOptions(options, {formatted : true});
                    if (!options.formatted) {
                        options.parens = false;
                    }
                    var areacode = this.areacode(options).toString();
                    var exchange = this.natural({min: 2, max: 9}).toString() +
                        this.natural({min: 0, max: 9}).toString() +
                        this.natural({min: 0, max: 9}).toString();

                    var subscriber = this.natural({min: 1000, max: 9999}).toString(); // this could be random [0-9]{4}

                    return options.formatted ? areacode + ' ' + exchange + '-' + subscriber : areacode + exchange + subscriber;
                };

                Chance.prototype.postal = function () {
                    // Postal District
                    var pd = this.character({pool: "XVTSRPNKLMHJGECBA"});
                    // Forward Sortation Area (FSA)
                    var fsa = pd + this.natural({max: 9}) + this.character({alpha: true, casing: "upper"});
                    // Local Delivery Unut (LDU)
                    var ldu = this.natural({max: 9}) + this.character({alpha: true, casing: "upper"}) + this.natural({max: 9});

                    return fsa + " " + ldu;
                };

                Chance.prototype.provinces = function () {
                    return this.get("provinces");
                };

                Chance.prototype.province = function (options) {
                    return (options && options.full) ?
                        this.pick(this.provinces()).name :
                    this.pick(this.provinces()).abbreviation;
                };

                Chance.prototype.radio = function (options) {
                    // Initial Letter (Typically Designated by Side of Mississippi River)
                    options = initOptions(options, {side : "?"});
                    var fl = "";
                    switch (options.side.toLowerCase()) {
                        case "east":
                        case "e":
                            fl = "W";
                            break;
                        case "west":
                        case "w":
                            fl = "K";
                            break;
                        default:
                            fl = this.character({pool: "KW"});
                            break;
                    }

                    return fl + this.character({alpha: true, casing: "upper"}) +
                        this.character({alpha: true, casing: "upper"}) +
                        this.character({alpha: true, casing: "upper"});
                };

                Chance.prototype.state = function (options) {
                    return (options && options.full) ?
                        this.pick(this.states(options)).name :
                    this.pick(this.states(options)).abbreviation;
                };

                Chance.prototype.states = function (options) {
                    options = initOptions(options);

                    var states,
                        us_states_and_dc = this.get("us_states_and_dc"),
                        territories = this.get("territories"),
                        armed_forces = this.get("armed_forces");

                    states = us_states_and_dc;

                    if (options.territories) {
                        states = states.concat(territories);
                    }
                    if (options.armed_forces) {
                        states = states.concat(armed_forces);
                    }

                    return states;
                };

                Chance.prototype.street = function (options) {
                    options = initOptions(options);

                    var street = this.word({syllables: 2});
                    street = this.capitalize(street);
                    street += ' ';
                    street += options.short_suffix ?
                        this.street_suffix().abbreviation :
                    this.street_suffix().name;
                    return street;
                };

                Chance.prototype.street_suffix = function () {
                    return this.pick(this.street_suffixes());
                };

                Chance.prototype.street_suffixes = function () {
                    // These are the most common suffixes.
                    return this.get("street_suffixes");
                };

                Chance.prototype.tv = function (options) {
                    return this.radio(options);
                };

                // Note: only returning US zip codes, internationalization will be a whole
                // other beast to tackle at some point.
                Chance.prototype.zip = function (options) {
                    var zip = this.n(this.natural, 5, {max: 9});

                    if (options && options.plusfour === true) {
                        zip.push('-');
                        zip = zip.concat(this.n(this.natural, 4, {max: 9}));
                    }

                    return zip.join("");
                };

                // -- End Address --

                // -- Time

                Chance.prototype.ampm = function () {
                    return this.bool() ? 'am' : 'pm';
                };

                Chance.prototype.date = function (options) {
                    var m = this.month({raw: true}),
                        date_string;

                    options = initOptions(options, {
                        year: parseInt(this.year(), 10),
                        // Necessary to subtract 1 because Date() 0-indexes month but not day or year
                        // for some reason.
                        month: m.numeric - 1,
                        day: this.natural({min: 1, max: m.days}),
                        hour: this.hour(),
                        minute: this.minute(),
                        second: this.second(),
                        millisecond: this.millisecond(),
                        american: true,
                        string: false
                    });

                    var date = new Date(options.year, options.month, options.day, options.hour, options.minute, options.second, options.millisecond);

                    if (options.american) {
                        // Adding 1 to the month is necessary because Date() 0-indexes
                        // months but not day for some odd reason.
                        date_string = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
                    } else {
                        date_string = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
                    }

                    return options.string ? date_string : date;
                };

                Chance.prototype.hammertime = function (options) {
                    return this.date(options).getTime();
                };

                Chance.prototype.hour = function (options) {
                    options = initOptions(options);
                    var max = options.twentyfour ? 24 : 12;
                    return this.natural({min: 1, max: max});
                };

                Chance.prototype.millisecond = function () {
                    return this.natural({max: 999});
                };

                Chance.prototype.minute = Chance.prototype.second = function () {
                    return this.natural({max: 59});
                };

                Chance.prototype.month = function (options) {
                    options = initOptions(options);
                    var month = this.pick(this.months());
                    return options.raw ? month : month.name;
                };

                Chance.prototype.months = function () {
                    return this.get("months");
                };

                Chance.prototype.second = function () {
                    return this.natural({max: 59});
                };

                Chance.prototype.timestamp = function () {
                    return this.natural({min: 1, max: parseInt(new Date().getTime() / 1000, 10)});
                };

                Chance.prototype.year = function (options) {
                    // Default to current year as min if none specified
                    options = initOptions(options, {min: new Date().getFullYear()});

                    // Default to one century after current year as max if none specified
                    options.max = (typeof options.max !== "undefined") ? options.max : options.min + 100;

                    return this.natural(options).toString();
                };

                // -- End Time

                // -- Finance --

                Chance.prototype.cc = function (options) {
                    options = initOptions(options);

                    var type, number, to_generate;

                    type = (options.type) ?
                        this.cc_type({ name: options.type, raw: true }) :
                    this.cc_type({ raw: true });

                    number = type.prefix.split("");
                    to_generate = type.length - type.prefix.length - 1;

                    // Generates n - 1 digits
                    number = number.concat(this.n(this.integer, to_generate, {min: 0, max: 9}));

                    // Generates the last digit according to Luhn algorithm
                    number.push(this.luhn_calculate(number.join("")));

                    return number.join("");
                };

                Chance.prototype.cc_types = function () {
                    // http://en.wikipedia.org/wiki/Bank_card_number#Issuer_identification_number_.28IIN.29
                    return this.get("cc_types");
                };

                Chance.prototype.cc_type = function (options) {
                    options = initOptions(options);
                    var types = this.cc_types(),
                        type = null;

                    if (options.name) {
                        for (var i = 0; i < types.length; i++) {
                            // Accept either name or short_name to specify card type
                            if (types[i].name === options.name || types[i].short_name === options.name) {
                                type = types[i];
                                break;
                            }
                        }
                        if (type === null) {
                            throw new Error("Credit card type '" + options.name + "'' is not supported");
                        }
                    } else {
                        type = this.pick(types);
                    }

                    return options.raw ? type : type.name;
                };

                Chance.prototype.dollar = function (options) {
                    // By default, a somewhat more sane max for dollar than all available numbers
                    options = initOptions(options, {max : 10000, min : 0});

                    var dollar = this.floating({min: options.min, max: options.max, fixed: 2}).toString(),
                        cents = dollar.split('.')[1];

                    if (cents === undefined) {
                        dollar += '.00';
                    } else if (cents.length < 2) {
                        dollar = dollar + '0';
                    }

                    if (dollar < 0) {
                        return '-$' + dollar.replace('-', '');
                    } else {
                        return '$' + dollar;
                    }
                };

                Chance.prototype.exp = function (options) {
                    options = initOptions(options);
                    var exp = {};

                    exp.year = this.exp_year();

                    // If the year is this year, need to ensure month is greater than the
                    // current month or this expiration will not be valid
                    if (exp.year === (new Date().getFullYear())) {
                        exp.month = this.exp_month({future: true});
                    } else {
                        exp.month = this.exp_month();
                    }

                    return options.raw ? exp : exp.month + '/' + exp.year;
                };

                Chance.prototype.exp_month = function (options) {
                    options = initOptions(options);
                    var month, month_int,
                        curMonth = new Date().getMonth();

                    if (options.future) {
                        do {
                            month = this.month({raw: true}).numeric;
                            month_int = parseInt(month, 10);
                        } while (month_int < curMonth);
                    } else {
                        month = this.month({raw: true}).numeric;
                    }

                    return month;
                };

                Chance.prototype.exp_year = function () {
                    return this.year({max: new Date().getFullYear() + 10});
                };

                //return all world currency by ISO 4217
                Chance.prototype.currency_types = function () {
                    return this.get("currency_types");
                };


                //return random world currency by ISO 4217
                Chance.prototype.currency = function () {
                    return this.pick(this.currency_types());
                };

                //Return random correct currency exchange pair (e.g. EUR/USD) or array of currency code
                Chance.prototype.currency_pair = function (returnAsString) {
                    var currencies = this.unique(this.currency, 2, {
                        comparator: function(arr, val) {

                            return arr.reduce(function(acc, item) {
                                // If a match has been found, short circuit check and just return
                                return acc || (item.code === val.code);
                            }, false);
                        }
                    });

                    if (returnAsString) {
                        return  currencies[0] + '/' + currencies[1];
                    } else {
                        return currencies;
                    }
                };

                // -- End Finance

                // -- Miscellaneous --

                // Dice - For all the board game geeks out there, myself included ;)
                function diceFn (range) {
                    return function () {
                        return this.natural(range);
                    };
                }
                Chance.prototype.d4 = diceFn({min: 1, max: 4});
                Chance.prototype.d6 = diceFn({min: 1, max: 6});
                Chance.prototype.d8 = diceFn({min: 1, max: 8});
                Chance.prototype.d10 = diceFn({min: 1, max: 10});
                Chance.prototype.d12 = diceFn({min: 1, max: 12});
                Chance.prototype.d20 = diceFn({min: 1, max: 20});
                Chance.prototype.d30 = diceFn({min: 1, max: 30});
                Chance.prototype.d100 = diceFn({min: 1, max: 100});

                Chance.prototype.rpg = function (thrown, options) {
                    options = initOptions(options);
                    if (thrown === null) {
                        throw new Error("A type of die roll must be included");
                    } else {
                        var bits = thrown.toLowerCase().split("d"),
                            rolls = [];

                        if (bits.length !== 2 || !parseInt(bits[0], 10) || !parseInt(bits[1], 10)) {
                            throw new Error("Invalid format provided. Please provide #d# where the first # is the number of dice to roll, the second # is the max of each die");
                        }
                        for (var i = bits[0]; i > 0; i--) {
                            rolls[i - 1] = this.natural({min: 1, max: bits[1]});
                        }
                        return (typeof options.sum !== 'undefined' && options.sum) ? rolls.reduce(function (p, c) { return p + c; }) : rolls;
                    }
                };

                // Guid
                Chance.prototype.guid = function (options) {
                    options = options || {version: 5};

                    var guid_pool = "ABCDEF1234567890",
                        variant_pool = "AB89",
                        guid = this.string({pool: guid_pool, length: 8}) + '-' +
                        this.string({pool: guid_pool, length: 4}) + '-' +
                        // The Version
                        options.version +
                        this.string({pool: guid_pool, length: 3}) + '-' +
                        // The Variant
                        this.string({pool: variant_pool, length: 1}) +
                        this.string({pool: guid_pool, length: 3}) + '-' +
                        this.string({pool: guid_pool, length: 12});
                    return guid;
                };

                // Hash
                Chance.prototype.hash = function (options) {
                    options = initOptions(options, {length : 40, casing: 'lower'});
                    var pool = options.casing === 'upper' ? HEX_POOL.toUpperCase() : HEX_POOL;
                    return this.string({pool: pool, length: options.length});
                };

                Chance.prototype.luhn_check = function (num) {
                    var str = num.toString();
                    var checkDigit = +str.substring(str.length - 1);
                    return checkDigit === this.luhn_calculate(+str.substring(0, str.length - 1));
                };

                Chance.prototype.luhn_calculate = function (num) {
                    var digits = num.toString().split("").reverse();
                    var sum = 0;
                    var digit;

                    for (var i = 0, l = digits.length; l > i; ++i) {
                        digit = +digits[i];
                        if (i % 2 === 0) {
                            digit *= 2;
                            if (digit > 9) {
                                digit -= 9;
                            }
                        }
                        sum += digit;
                    }
                    return (sum * 9) % 10;
                };


                var data = {

                    firstNames: {
                        "male": ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Charles", "Thomas", "Christopher", "Daniel", "Matthew", "George", "Donald", "Anthony", "Paul", "Mark", "Edward", "Steven", "Kenneth", "Andrew", "Brian", "Joshua", "Kevin", "Ronald", "Timothy", "Jason", "Jeffrey", "Frank", "Gary", "Ryan", "Nicholas", "Eric", "Stephen", "Jacob", "Larry", "Jonathan", "Scott", "Raymond", "Justin", "Brandon", "Gregory", "Samuel", "Benjamin", "Patrick", "Jack", "Henry", "Walter", "Dennis", "Jerry", "Alexander", "Peter", "Tyler", "Douglas", "Harold", "Aaron", "Jose", "Adam", "Arthur", "Zachary", "Carl", "Nathan", "Albert", "Kyle", "Lawrence", "Joe", "Willie", "Gerald", "Roger", "Keith", "Jeremy", "Terry", "Harry", "Ralph", "Sean", "Jesse", "Roy", "Louis", "Billy", "Austin", "Bruce", "Eugene", "Christian", "Bryan", "Wayne", "Russell", "Howard", "Fred", "Ethan", "Jordan", "Philip", "Alan", "Juan", "Randy", "Vincent", "Bobby", "Dylan", "Johnny", "Phillip", "Victor", "Clarence", "Ernest", "Martin", "Craig", "Stanley", "Shawn", "Travis", "Bradley", "Leonard", "Earl", "Gabriel", "Jimmy", "Francis", "Todd", "Noah", "Danny", "Dale", "Cody", "Carlos", "Allen", "Frederick", "Logan", "Curtis", "Alex", "Joel", "Luis", "Norman", "Marvin", "Glenn", "Tony", "Nathaniel", "Rodney", "Melvin", "Alfred", "Steve", "Cameron", "Chad", "Edwin", "Caleb", "Evan", "Antonio", "Lee", "Herbert", "Jeffery", "Isaac", "Derek", "Ricky", "Marcus", "Theodore", "Elijah", "Luke", "Jesus", "Eddie", "Troy", "Mike", "Dustin", "Ray", "Adrian", "Bernard", "Leroy", "Angel", "Randall", "Wesley", "Ian", "Jared", "Mason", "Hunter", "Calvin", "Oscar", "Clifford", "Jay", "Shane", "Ronnie", "Barry", "Lucas", "Corey", "Manuel", "Leo", "Tommy", "Warren", "Jackson", "Isaiah", "Connor", "Don", "Dean", "Jon", "Julian", "Miguel", "Bill", "Lloyd", "Charlie", "Mitchell", "Leon", "Jerome", "Darrell", "Jeremiah", "Alvin", "Brett", "Seth", "Floyd", "Jim", "Blake", "Micheal", "Gordon", "Trevor", "Lewis", "Erik", "Edgar", "Vernon", "Devin", "Gavin", "Jayden", "Chris", "Clyde", "Tom", "Derrick", "Mario", "Brent", "Marc", "Herman", "Chase", "Dominic", "Ricardo", "Franklin", "Maurice", "Max", "Aiden", "Owen", "Lester", "Gilbert", "Elmer", "Gene", "Francisco", "Glen", "Cory", "Garrett", "Clayton", "Sam", "Jorge", "Chester", "Alejandro", "Jeff", "Harvey", "Milton", "Cole", "Ivan", "Andre", "Duane", "Landon"],
                        "female": ["Mary", "Emma", "Elizabeth", "Minnie", "Margaret", "Ida", "Alice", "Bertha", "Sarah", "Annie", "Clara", "Ella", "Florence", "Cora", "Martha", "Laura", "Nellie", "Grace", "Carrie", "Maude", "Mabel", "Bessie", "Jennie", "Gertrude", "Julia", "Hattie", "Edith", "Mattie", "Rose", "Catherine", "Lillian", "Ada", "Lillie", "Helen", "Jessie", "Louise", "Ethel", "Lula", "Myrtle", "Eva", "Frances", "Lena", "Lucy", "Edna", "Maggie", "Pearl", "Daisy", "Fannie", "Josephine", "Dora", "Rosa", "Katherine", "Agnes", "Marie", "Nora", "May", "Mamie", "Blanche", "Stella", "Ellen", "Nancy", "Effie", "Sallie", "Nettie", "Della", "Lizzie", "Flora", "Susie", "Maud", "Mae", "Etta", "Harriet", "Sadie", "Caroline", "Katie", "Lydia", "Elsie", "Kate", "Susan", "Mollie", "Alma", "Addie", "Georgia", "Eliza", "Lulu", "Nannie", "Lottie", "Amanda", "Belle", "Charlotte", "Rebecca", "Ruth", "Viola", "Olive", "Amelia", "Hannah", "Jane", "Virginia", "Emily", "Matilda", "Irene", "Kathryn", "Esther", "Willie", "Henrietta", "Ollie", "Amy", "Rachel", "Sara", "Estella", "Theresa", "Augusta", "Ora", "Pauline", "Josie", "Lola", "Sophia", "Leona", "Anne", "Mildred", "Ann", "Beulah", "Callie", "Lou", "Delia", "Eleanor", "Barbara", "Iva", "Louisa", "Maria", "Mayme", "Evelyn", "Estelle", "Nina", "Betty", "Marion", "Bettie", "Dorothy", "Luella", "Inez", "Lela", "Rosie", "Allie", "Millie", "Janie", "Cornelia", "Victoria", "Ruby", "Winifred", "Alta", "Celia", "Christine", "Beatrice", "Birdie", "Harriett", "Mable", "Myra", "Sophie", "Tillie", "Isabel", "Sylvia", "Carolyn", "Isabelle", "Leila", "Sally", "Ina", "Essie", "Bertie", "Nell", "Alberta", "Katharine", "Lora", "Rena", "Mina", "Rhoda", "Mathilda", "Abbie", "Eula", "Dollie", "Hettie", "Eunice", "Fanny", "Ola", "Lenora", "Adelaide", "Christina", "Lelia", "Nelle", "Sue", "Johanna", "Lilly", "Lucinda", "Minerva", "Lettie", "Roxie", "Cynthia", "Helena", "Hilda", "Hulda", "Bernice", "Genevieve", "Jean", "Cordelia", "Marian", "Francis", "Jeanette", "Adeline", "Gussie", "Leah", "Lois", "Lura", "Mittie", "Hallie", "Isabella", "Olga", "Phoebe", "Teresa", "Hester", "Lida", "Lina", "Winnie", "Claudia", "Marguerite", "Vera", "Cecelia", "Bess", "Emilie", "John", "Rosetta", "Verna", "Myrtie", "Cecilia", "Elva", "Olivia", "Ophelia", "Georgie", "Elnora", "Violet", "Adele", "Lily", "Linnie", "Loretta", "Madge", "Polly", "Virgie", "Eugenia", "Lucile", "Lucille", "Mabelle", "Rosalie"]
                    },

                    lastNames: ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'Hernandez', 'King', 'Wright', 'Lopez', 'Hill', 'Scott', 'Green', 'Adams', 'Baker', 'Gonzalez', 'Nelson', 'Carter', 'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart', 'Sanchez', 'Morris', 'Rogers', 'Reed', 'Cook', 'Morgan', 'Bell', 'Murphy', 'Bailey', 'Rivera', 'Cooper', 'Richardson', 'Cox', 'Howard', 'Ward', 'Torres', 'Peterson', 'Gray', 'Ramirez', 'James', 'Watson', 'Brooks', 'Kelly', 'Sanders', 'Price', 'Bennett', 'Wood', 'Barnes', 'Ross', 'Henderson', 'Coleman', 'Jenkins', 'Perry', 'Powell', 'Long', 'Patterson', 'Hughes', 'Flores', 'Washington', 'Butler', 'Simmons', 'Foster', 'Gonzales', 'Bryant', 'Alexander', 'Russell', 'Griffin', 'Diaz', 'Hayes', 'Myers', 'Ford', 'Hamilton', 'Graham', 'Sullivan', 'Wallace', 'Woods', 'Cole', 'West', 'Jordan', 'Owens', 'Reynolds', 'Fisher', 'Ellis', 'Harrison', 'Gibson', 'McDonald', 'Cruz', 'Marshall', 'Ortiz', 'Gomez', 'Murray', 'Freeman', 'Wells', 'Webb', 'Simpson', 'Stevens', 'Tucker', 'Porter', 'Hunter', 'Hicks', 'Crawford', 'Henry', 'Boyd', 'Mason', 'Morales', 'Kennedy', 'Warren', 'Dixon', 'Ramos', 'Reyes', 'Burns', 'Gordon', 'Shaw', 'Holmes', 'Rice', 'Robertson', 'Hunt', 'Black', 'Daniels', 'Palmer', 'Mills', 'Nichols', 'Grant', 'Knight', 'Ferguson', 'Rose', 'Stone', 'Hawkins', 'Dunn', 'Perkins', 'Hudson', 'Spencer', 'Gardner', 'Stephens', 'Payne', 'Pierce', 'Berry', 'Matthews', 'Arnold', 'Wagner', 'Willis', 'Ray', 'Watkins', 'Olson', 'Carroll', 'Duncan', 'Snyder', 'Hart', 'Cunningham', 'Bradley', 'Lane', 'Andrews', 'Ruiz', 'Harper', 'Fox', 'Riley', 'Armstrong', 'Carpenter', 'Weaver', 'Greene', 'Lawrence', 'Elliott', 'Chavez', 'Sims', 'Austin', 'Peters', 'Kelley', 'Franklin', 'Lawson', 'Fields', 'Gutierrez', 'Ryan', 'Schmidt', 'Carr', 'Vasquez', 'Castillo', 'Wheeler', 'Chapman', 'Oliver', 'Montgomery', 'Richards', 'Williamson', 'Johnston', 'Banks', 'Meyer', 'Bishop', 'McCoy', 'Howell', 'Alvarez', 'Morrison', 'Hansen', 'Fernandez', 'Garza', 'Harvey', 'Little', 'Burton', 'Stanley', 'Nguyen', 'George', 'Jacobs', 'Reid', 'Kim', 'Fuller', 'Lynch', 'Dean', 'Gilbert', 'Garrett', 'Romero', 'Welch', 'Larson', 'Frazier', 'Burke', 'Hanson', 'Day', 'Mendoza', 'Moreno', 'Bowman', 'Medina', 'Fowler', 'Brewer', 'Hoffman', 'Carlson', 'Silva', 'Pearson', 'Holland', 'Douglas', 'Fleming', 'Jensen', 'Vargas', 'Byrd', 'Davidson', 'Hopkins', 'May', 'Terry', 'Herrera', 'Wade', 'Soto', 'Walters', 'Curtis', 'Neal', 'Caldwell', 'Lowe', 'Jennings', 'Barnett', 'Graves', 'Jimenez', 'Horton', 'Shelton', 'Barrett', 'Obrien', 'Castro', 'Sutton', 'Gregory', 'McKinney', 'Lucas', 'Miles', 'Craig', 'Rodriquez', 'Chambers', 'Holt', 'Lambert', 'Fletcher', 'Watts', 'Bates', 'Hale', 'Rhodes', 'Pena', 'Beck', 'Newman', 'Haynes', 'McDaniel', 'Mendez', 'Bush', 'Vaughn', 'Parks', 'Dawson', 'Santiago', 'Norris', 'Hardy', 'Love', 'Steele', 'Curry', 'Powers', 'Schultz', 'Barker', 'Guzman', 'Page', 'Munoz', 'Ball', 'Keller', 'Chandler', 'Weber', 'Leonard', 'Walsh', 'Lyons', 'Ramsey', 'Wolfe', 'Schneider', 'Mullins', 'Benson', 'Sharp', 'Bowen', 'Daniel', 'Barber', 'Cummings', 'Hines', 'Baldwin', 'Griffith', 'Valdez', 'Hubbard', 'Salazar', 'Reeves', 'Warner', 'Stevenson', 'Burgess', 'Santos', 'Tate', 'Cross', 'Garner', 'Mann', 'Mack', 'Moss', 'Thornton', 'Dennis', 'McGee', 'Farmer', 'Delgado', 'Aguilar', 'Vega', 'Glover', 'Manning', 'Cohen', 'Harmon', 'Rodgers', 'Robbins', 'Newton', 'Todd', 'Blair', 'Higgins', 'Ingram', 'Reese', 'Cannon', 'Strickland', 'Townsend', 'Potter', 'Goodwin', 'Walton', 'Rowe', 'Hampton', 'Ortega', 'Patton', 'Swanson', 'Joseph', 'Francis', 'Goodman', 'Maldonado', 'Yates', 'Becker', 'Erickson', 'Hodges', 'Rios', 'Conner', 'Adkins', 'Webster', 'Norman', 'Malone', 'Hammond', 'Flowers', 'Cobb', 'Moody', 'Quinn', 'Blake', 'Maxwell', 'Pope', 'Floyd', 'Osborne', 'Paul', 'McCarthy', 'Guerrero', 'Lindsey', 'Estrada', 'Sandoval', 'Gibbs', 'Tyler', 'Gross', 'Fitzgerald', 'Stokes', 'Doyle', 'Sherman', 'Saunders', 'Wise', 'Colon', 'Gill', 'Alvarado', 'Greer', 'Padilla', 'Simon', 'Waters', 'Nunez', 'Ballard', 'Schwartz', 'McBride', 'Houston', 'Christensen', 'Klein', 'Pratt', 'Briggs', 'Parsons', 'McLaughlin', 'Zimmerman', 'French', 'Buchanan', 'Moran', 'Copeland', 'Roy', 'Pittman', 'Brady', 'McCormick', 'Holloway', 'Brock', 'Poole', 'Frank', 'Logan', 'Owen', 'Bass', 'Marsh', 'Drake', 'Wong', 'Jefferson', 'Park', 'Morton', 'Abbott', 'Sparks', 'Patrick', 'Norton', 'Huff', 'Clayton', 'Massey', 'Lloyd', 'Figueroa', 'Carson', 'Bowers', 'Roberson', 'Barton', 'Tran', 'Lamb', 'Harrington', 'Casey', 'Boone', 'Cortez', 'Clarke', 'Mathis', 'Singleton', 'Wilkins', 'Cain', 'Bryan', 'Underwood', 'Hogan', 'McKenzie', 'Collier', 'Luna', 'Phelps', 'McGuire', 'Allison', 'Bridges', 'Wilkerson', 'Nash', 'Summers', 'Atkins'],

                    provinces: [
                        {name: 'Alberta', abbreviation: 'AB'},
                        {name: 'British Columbia', abbreviation: 'BC'},
                        {name: 'Manitoba', abbreviation: 'MB'},
                        {name: 'New Brunswick', abbreviation: 'NB'},
                        {name: 'Newfoundland and Labrador', abbreviation: 'NL'},
                        {name: 'Nova Scotia', abbreviation: 'NS'},
                        {name: 'Ontario', abbreviation: 'ON'},
                        {name: 'Prince Edward Island', abbreviation: 'PE'},
                        {name: 'Quebec', abbreviation: 'QC'},
                        {name: 'Saskatchewan', abbreviation: 'SK'},

                        // The case could be made that the following are not actually provinces
                        // since they are technically considered "territories" however they all
                        // look the same on an envelope!
                        {name: 'Northwest Territories', abbreviation: 'NT'},
                        {name: 'Nunavut', abbreviation: 'NU'},
                        {name: 'Yukon', abbreviation: 'YT'}
                    ],

                    us_states_and_dc: [
                        {name: 'Alabama', abbreviation: 'AL'},
                        {name: 'Alaska', abbreviation: 'AK'},
                        {name: 'Arizona', abbreviation: 'AZ'},
                        {name: 'Arkansas', abbreviation: 'AR'},
                        {name: 'California', abbreviation: 'CA'},
                        {name: 'Colorado', abbreviation: 'CO'},
                        {name: 'Connecticut', abbreviation: 'CT'},
                        {name: 'Delaware', abbreviation: 'DE'},
                        {name: 'District of Columbia', abbreviation: 'DC'},
                        {name: 'Florida', abbreviation: 'FL'},
                        {name: 'Georgia', abbreviation: 'GA'},
                        {name: 'Hawaii', abbreviation: 'HI'},
                        {name: 'Idaho', abbreviation: 'ID'},
                        {name: 'Illinois', abbreviation: 'IL'},
                        {name: 'Indiana', abbreviation: 'IN'},
                        {name: 'Iowa', abbreviation: 'IA'},
                        {name: 'Kansas', abbreviation: 'KS'},
                        {name: 'Kentucky', abbreviation: 'KY'},
                        {name: 'Louisiana', abbreviation: 'LA'},
                        {name: 'Maine', abbreviation: 'ME'},
                        {name: 'Maryland', abbreviation: 'MD'},
                        {name: 'Massachusetts', abbreviation: 'MA'},
                        {name: 'Michigan', abbreviation: 'MI'},
                        {name: 'Minnesota', abbreviation: 'MN'},
                        {name: 'Mississippi', abbreviation: 'MS'},
                        {name: 'Missouri', abbreviation: 'MO'},
                        {name: 'Montana', abbreviation: 'MT'},
                        {name: 'Nebraska', abbreviation: 'NE'},
                        {name: 'Nevada', abbreviation: 'NV'},
                        {name: 'New Hampshire', abbreviation: 'NH'},
                        {name: 'New Jersey', abbreviation: 'NJ'},
                        {name: 'New Mexico', abbreviation: 'NM'},
                        {name: 'New York', abbreviation: 'NY'},
                        {name: 'North Carolina', abbreviation: 'NC'},
                        {name: 'North Dakota', abbreviation: 'ND'},
                        {name: 'Ohio', abbreviation: 'OH'},
                        {name: 'Oklahoma', abbreviation: 'OK'},
                        {name: 'Oregon', abbreviation: 'OR'},
                        {name: 'Pennsylvania', abbreviation: 'PA'},
                        {name: 'Rhode Island', abbreviation: 'RI'},
                        {name: 'South Carolina', abbreviation: 'SC'},
                        {name: 'South Dakota', abbreviation: 'SD'},
                        {name: 'Tennessee', abbreviation: 'TN'},
                        {name: 'Texas', abbreviation: 'TX'},
                        {name: 'Utah', abbreviation: 'UT'},
                        {name: 'Vermont', abbreviation: 'VT'},
                        {name: 'Virginia', abbreviation: 'VA'},
                        {name: 'Washington', abbreviation: 'WA'},
                        {name: 'West Virginia', abbreviation: 'WV'},
                        {name: 'Wisconsin', abbreviation: 'WI'},
                        {name: 'Wyoming', abbreviation: 'WY'}
                    ],

                    territories: [
                        {name: 'American Samoa', abbreviation: 'AS'},
                        {name: 'Federated States of Micronesia', abbreviation: 'FM'},
                        {name: 'Guam', abbreviation: 'GU'},
                        {name: 'Marshall Islands', abbreviation: 'MH'},
                        {name: 'Northern Mariana Islands', abbreviation: 'MP'},
                        {name: 'Puerto Rico', abbreviation: 'PR'},
                        {name: 'Virgin Islands, U.S.', abbreviation: 'VI'}
                    ],

                    armed_forces: [
                        {name: 'Armed Forces Europe', abbreviation: 'AE'},
                        {name: 'Armed Forces Pacific', abbreviation: 'AP'},
                        {name: 'Armed Forces the Americas', abbreviation: 'AA'}
                    ],

                    street_suffixes: [
                        {name: 'Avenue', abbreviation: 'Ave'},
                        {name: 'Boulevard', abbreviation: 'Blvd'},
                        {name: 'Center', abbreviation: 'Ctr'},
                        {name: 'Circle', abbreviation: 'Cir'},
                        {name: 'Court', abbreviation: 'Ct'},
                        {name: 'Drive', abbreviation: 'Dr'},
                        {name: 'Extension', abbreviation: 'Ext'},
                        {name: 'Glen', abbreviation: 'Gln'},
                        {name: 'Grove', abbreviation: 'Grv'},
                        {name: 'Heights', abbreviation: 'Hts'},
                        {name: 'Highway', abbreviation: 'Hwy'},
                        {name: 'Junction', abbreviation: 'Jct'},
                        {name: 'Key', abbreviation: 'Key'},
                        {name: 'Lane', abbreviation: 'Ln'},
                        {name: 'Loop', abbreviation: 'Loop'},
                        {name: 'Manor', abbreviation: 'Mnr'},
                        {name: 'Mill', abbreviation: 'Mill'},
                        {name: 'Park', abbreviation: 'Park'},
                        {name: 'Parkway', abbreviation: 'Pkwy'},
                        {name: 'Pass', abbreviation: 'Pass'},
                        {name: 'Path', abbreviation: 'Path'},
                        {name: 'Pike', abbreviation: 'Pike'},
                        {name: 'Place', abbreviation: 'Pl'},
                        {name: 'Plaza', abbreviation: 'Plz'},
                        {name: 'Point', abbreviation: 'Pt'},
                        {name: 'Ridge', abbreviation: 'Rdg'},
                        {name: 'River', abbreviation: 'Riv'},
                        {name: 'Road', abbreviation: 'Rd'},
                        {name: 'Square', abbreviation: 'Sq'},
                        {name: 'Street', abbreviation: 'St'},
                        {name: 'Terrace', abbreviation: 'Ter'},
                        {name: 'Trail', abbreviation: 'Trl'},
                        {name: 'Turnpike', abbreviation: 'Tpke'},
                        {name: 'View', abbreviation: 'Vw'},
                        {name: 'Way', abbreviation: 'Way'}
                    ],

                    months: [
                        {name: 'January', short_name: 'Jan', numeric: '01', days: 31},
                        // Not messing with leap years...
                        {name: 'February', short_name: 'Feb', numeric: '02', days: 28},
                        {name: 'March', short_name: 'Mar', numeric: '03', days: 31},
                        {name: 'April', short_name: 'Apr', numeric: '04', days: 30},
                        {name: 'May', short_name: 'May', numeric: '05', days: 31},
                        {name: 'June', short_name: 'Jun', numeric: '06', days: 30},
                        {name: 'July', short_name: 'Jul', numeric: '07', days: 31},
                        {name: 'August', short_name: 'Aug', numeric: '08', days: 31},
                        {name: 'September', short_name: 'Sep', numeric: '09', days: 30},
                        {name: 'October', short_name: 'Oct', numeric: '10', days: 31},
                        {name: 'November', short_name: 'Nov', numeric: '11', days: 30},
                        {name: 'December', short_name: 'Dec', numeric: '12', days: 31}
                    ],

                    // http://en.wikipedia.org/wiki/Bank_card_number#Issuer_identification_number_.28IIN.29
                    cc_types: [
                        {name: "American Express", short_name: 'amex', prefix: '34', length: 15},
                        {name: "Bankcard", short_name: 'bankcard', prefix: '5610', length: 16},
                        {name: "China UnionPay", short_name: 'chinaunion', prefix: '62', length: 16},
                        {name: "Diners Club Carte Blanche", short_name: 'dccarte', prefix: '300', length: 14},
                        {name: "Diners Club enRoute", short_name: 'dcenroute', prefix: '2014', length: 15},
                        {name: "Diners Club International", short_name: 'dcintl', prefix: '36', length: 14},
                        {name: "Diners Club United States & Canada", short_name: 'dcusc', prefix: '54', length: 16},
                        {name: "Discover Card", short_name: 'discover', prefix: '6011', length: 16},
                        {name: "InstaPayment", short_name: 'instapay', prefix: '637', length: 16},
                        {name: "JCB", short_name: 'jcb', prefix: '3528', length: 16},
                        {name: "Laser", short_name: 'laser', prefix: '6304', length: 16},
                        {name: "Maestro", short_name: 'maestro', prefix: '5018', length: 16},
                        {name: "Mastercard", short_name: 'mc', prefix: '51', length: 16},
                        {name: "Solo", short_name: 'solo', prefix: '6334', length: 16},
                        {name: "Switch", short_name: 'switch', prefix: '4903', length: 16},
                        {name: "Visa", short_name: 'visa', prefix: '4', length: 16},
                        {name: "Visa Electron", short_name: 'electron', prefix: '4026', length: 16}
                    ],

                    //return all world currency by ISO 4217
                    currency_types: [
                        {'code' : 'AED', 'name' : 'United Arab Emirates Dirham'},
                        {'code' : 'AFN', 'name' : 'Afghanistan Afghani'},
                        {'code' : 'ALL', 'name' : 'Albania Lek'},
                        {'code' : 'AMD', 'name' : 'Armenia Dram'},
                        {'code' : 'ANG', 'name' : 'Netherlands Antilles Guilder'},
                        {'code' : 'AOA', 'name' : 'Angola Kwanza'},
                        {'code' : 'ARS', 'name' : 'Argentina Peso'},
                        {'code' : 'AUD', 'name' : 'Australia Dollar'},
                        {'code' : 'AWG', 'name' : 'Aruba Guilder'},
                        {'code' : 'AZN', 'name' : 'Azerbaijan New Manat'},
                        {'code' : 'BAM', 'name' : 'Bosnia and Herzegovina Convertible Marka'},
                        {'code' : 'BBD', 'name' : 'Barbados Dollar'},
                        {'code' : 'BDT', 'name' : 'Bangladesh Taka'},
                        {'code' : 'BGN', 'name' : 'Bulgaria Lev'},
                        {'code' : 'BHD', 'name' : 'Bahrain Dinar'},
                        {'code' : 'BIF', 'name' : 'Burundi Franc'},
                        {'code' : 'BMD', 'name' : 'Bermuda Dollar'},
                        {'code' : 'BND', 'name' : 'Brunei Darussalam Dollar'},
                        {'code' : 'BOB', 'name' : 'Bolivia Boliviano'},
                        {'code' : 'BRL', 'name' : 'Brazil Real'},
                        {'code' : 'BSD', 'name' : 'Bahamas Dollar'},
                        {'code' : 'BTN', 'name' : 'Bhutan Ngultrum'},
                        {'code' : 'BWP', 'name' : 'Botswana Pula'},
                        {'code' : 'BYR', 'name' : 'Belarus Ruble'},
                        {'code' : 'BZD', 'name' : 'Belize Dollar'},
                        {'code' : 'CAD', 'name' : 'Canada Dollar'},
                        {'code' : 'CDF', 'name' : 'Congo/Kinshasa Franc'},
                        {'code' : 'CHF', 'name' : 'Switzerland Franc'},
                        {'code' : 'CLP', 'name' : 'Chile Peso'},
                        {'code' : 'CNY', 'name' : 'China Yuan Renminbi'},
                        {'code' : 'COP', 'name' : 'Colombia Peso'},
                        {'code' : 'CRC', 'name' : 'Costa Rica Colon'},
                        {'code' : 'CUC', 'name' : 'Cuba Convertible Peso'},
                        {'code' : 'CUP', 'name' : 'Cuba Peso'},
                        {'code' : 'CVE', 'name' : 'Cape Verde Escudo'},
                        {'code' : 'CZK', 'name' : 'Czech Republic Koruna'},
                        {'code' : 'DJF', 'name' : 'Djibouti Franc'},
                        {'code' : 'DKK', 'name' : 'Denmark Krone'},
                        {'code' : 'DOP', 'name' : 'Dominican Republic Peso'},
                        {'code' : 'DZD', 'name' : 'Algeria Dinar'},
                        {'code' : 'EGP', 'name' : 'Egypt Pound'},
                        {'code' : 'ERN', 'name' : 'Eritrea Nakfa'},
                        {'code' : 'ETB', 'name' : 'Ethiopia Birr'},
                        {'code' : 'EUR', 'name' : 'Euro Member Countries'},
                        {'code' : 'FJD', 'name' : 'Fiji Dollar'},
                        {'code' : 'FKP', 'name' : 'Falkland Islands (Malvinas) Pound'},
                        {'code' : 'GBP', 'name' : 'United Kingdom Pound'},
                        {'code' : 'GEL', 'name' : 'Georgia Lari'},
                        {'code' : 'GGP', 'name' : 'Guernsey Pound'},
                        {'code' : 'GHS', 'name' : 'Ghana Cedi'},
                        {'code' : 'GIP', 'name' : 'Gibraltar Pound'},
                        {'code' : 'GMD', 'name' : 'Gambia Dalasi'},
                        {'code' : 'GNF', 'name' : 'Guinea Franc'},
                        {'code' : 'GTQ', 'name' : 'Guatemala Quetzal'},
                        {'code' : 'GYD', 'name' : 'Guyana Dollar'},
                        {'code' : 'HKD', 'name' : 'Hong Kong Dollar'},
                        {'code' : 'HNL', 'name' : 'Honduras Lempira'},
                        {'code' : 'HRK', 'name' : 'Croatia Kuna'},
                        {'code' : 'HTG', 'name' : 'Haiti Gourde'},
                        {'code' : 'HUF', 'name' : 'Hungary Forint'},
                        {'code' : 'IDR', 'name' : 'Indonesia Rupiah'},
                        {'code' : 'ILS', 'name' : 'Israel Shekel'},
                        {'code' : 'IMP', 'name' : 'Isle of Man Pound'},
                        {'code' : 'INR', 'name' : 'India Rupee'},
                        {'code' : 'IQD', 'name' : 'Iraq Dinar'},
                        {'code' : 'IRR', 'name' : 'Iran Rial'},
                        {'code' : 'ISK', 'name' : 'Iceland Krona'},
                        {'code' : 'JEP', 'name' : 'Jersey Pound'},
                        {'code' : 'JMD', 'name' : 'Jamaica Dollar'},
                        {'code' : 'JOD', 'name' : 'Jordan Dinar'},
                        {'code' : 'JPY', 'name' : 'Japan Yen'},
                        {'code' : 'KES', 'name' : 'Kenya Shilling'},
                        {'code' : 'KGS', 'name' : 'Kyrgyzstan Som'},
                        {'code' : 'KHR', 'name' : 'Cambodia Riel'},
                        {'code' : 'KMF', 'name' : 'Comoros Franc'},
                        {'code' : 'KPW', 'name' : 'Korea (North) Won'},
                        {'code' : 'KRW', 'name' : 'Korea (South) Won'},
                        {'code' : 'KWD', 'name' : 'Kuwait Dinar'},
                        {'code' : 'KYD', 'name' : 'Cayman Islands Dollar'},
                        {'code' : 'KZT', 'name' : 'Kazakhstan Tenge'},
                        {'code' : 'LAK', 'name' : 'Laos Kip'},
                        {'code' : 'LBP', 'name' : 'Lebanon Pound'},
                        {'code' : 'LKR', 'name' : 'Sri Lanka Rupee'},
                        {'code' : 'LRD', 'name' : 'Liberia Dollar'},
                        {'code' : 'LSL', 'name' : 'Lesotho Loti'},
                        {'code' : 'LTL', 'name' : 'Lithuania Litas'},
                        {'code' : 'LYD', 'name' : 'Libya Dinar'},
                        {'code' : 'MAD', 'name' : 'Morocco Dirham'},
                        {'code' : 'MDL', 'name' : 'Moldova Leu'},
                        {'code' : 'MGA', 'name' : 'Madagascar Ariary'},
                        {'code' : 'MKD', 'name' : 'Macedonia Denar'},
                        {'code' : 'MMK', 'name' : 'Myanmar (Burma) Kyat'},
                        {'code' : 'MNT', 'name' : 'Mongolia Tughrik'},
                        {'code' : 'MOP', 'name' : 'Macau Pataca'},
                        {'code' : 'MRO', 'name' : 'Mauritania Ouguiya'},
                        {'code' : 'MUR', 'name' : 'Mauritius Rupee'},
                        {'code' : 'MVR', 'name' : 'Maldives (Maldive Islands) Rufiyaa'},
                        {'code' : 'MWK', 'name' : 'Malawi Kwacha'},
                        {'code' : 'MXN', 'name' : 'Mexico Peso'},
                        {'code' : 'MYR', 'name' : 'Malaysia Ringgit'},
                        {'code' : 'MZN', 'name' : 'Mozambique Metical'},
                        {'code' : 'NAD', 'name' : 'Namibia Dollar'},
                        {'code' : 'NGN', 'name' : 'Nigeria Naira'},
                        {'code' : 'NIO', 'name' : 'Nicaragua Cordoba'},
                        {'code' : 'NOK', 'name' : 'Norway Krone'},
                        {'code' : 'NPR', 'name' : 'Nepal Rupee'},
                        {'code' : 'NZD', 'name' : 'New Zealand Dollar'},
                        {'code' : 'OMR', 'name' : 'Oman Rial'},
                        {'code' : 'PAB', 'name' : 'Panama Balboa'},
                        {'code' : 'PEN', 'name' : 'Peru Nuevo Sol'},
                        {'code' : 'PGK', 'name' : 'Papua New Guinea Kina'},
                        {'code' : 'PHP', 'name' : 'Philippines Peso'},
                        {'code' : 'PKR', 'name' : 'Pakistan Rupee'},
                        {'code' : 'PLN', 'name' : 'Poland Zloty'},
                        {'code' : 'PYG', 'name' : 'Paraguay Guarani'},
                        {'code' : 'QAR', 'name' : 'Qatar Riyal'},
                        {'code' : 'RON', 'name' : 'Romania New Leu'},
                        {'code' : 'RSD', 'name' : 'Serbia Dinar'},
                        {'code' : 'RUB', 'name' : 'Russia Ruble'},
                        {'code' : 'RWF', 'name' : 'Rwanda Franc'},
                        {'code' : 'SAR', 'name' : 'Saudi Arabia Riyal'},
                        {'code' : 'SBD', 'name' : 'Solomon Islands Dollar'},
                        {'code' : 'SCR', 'name' : 'Seychelles Rupee'},
                        {'code' : 'SDG', 'name' : 'Sudan Pound'},
                        {'code' : 'SEK', 'name' : 'Sweden Krona'},
                        {'code' : 'SGD', 'name' : 'Singapore Dollar'},
                        {'code' : 'SHP', 'name' : 'Saint Helena Pound'},
                        {'code' : 'SLL', 'name' : 'Sierra Leone Leone'},
                        {'code' : 'SOS', 'name' : 'Somalia Shilling'},
                        {'code' : 'SPL', 'name' : 'Seborga Luigino'},
                        {'code' : 'SRD', 'name' : 'Suriname Dollar'},
                        {'code' : 'STD', 'name' : 'São Tomé and Príncipe Dobra'},
                        {'code' : 'SVC', 'name' : 'El Salvador Colon'},
                        {'code' : 'SYP', 'name' : 'Syria Pound'},
                        {'code' : 'SZL', 'name' : 'Swaziland Lilangeni'},
                        {'code' : 'THB', 'name' : 'Thailand Baht'},
                        {'code' : 'TJS', 'name' : 'Tajikistan Somoni'},
                        {'code' : 'TMT', 'name' : 'Turkmenistan Manat'},
                        {'code' : 'TND', 'name' : 'Tunisia Dinar'},
                        {'code' : 'TOP', 'name' : 'Tonga Pa\'anga'},
                        {'code' : 'TRY', 'name' : 'Turkey Lira'},
                        {'code' : 'TTD', 'name' : 'Trinidad and Tobago Dollar'},
                        {'code' : 'TVD', 'name' : 'Tuvalu Dollar'},
                        {'code' : 'TWD', 'name' : 'Taiwan New Dollar'},
                        {'code' : 'TZS', 'name' : 'Tanzania Shilling'},
                        {'code' : 'UAH', 'name' : 'Ukraine Hryvnia'},
                        {'code' : 'UGX', 'name' : 'Uganda Shilling'},
                        {'code' : 'USD', 'name' : 'United States Dollar'},
                        {'code' : 'UYU', 'name' : 'Uruguay Peso'},
                        {'code' : 'UZS', 'name' : 'Uzbekistan Som'},
                        {'code' : 'VEF', 'name' : 'Venezuela Bolivar'},
                        {'code' : 'VND', 'name' : 'Viet Nam Dong'},
                        {'code' : 'VUV', 'name' : 'Vanuatu Vatu'},
                        {'code' : 'WST', 'name' : 'Samoa Tala'},
                        {'code' : 'XAF', 'name' : 'Communauté Financière Africaine (BEAC) CFA Franc BEAC'},
                        {'code' : 'XCD', 'name' : 'East Caribbean Dollar'},
                        {'code' : 'XDR', 'name' : 'International Monetary Fund (IMF) Special Drawing Rights'},
                        {'code' : 'XOF', 'name' : 'Communauté Financière Africaine (BCEAO) Franc'},
                        {'code' : 'XPF', 'name' : 'Comptoirs Français du Pacifique (CFP) Franc'},
                        {'code' : 'YER', 'name' : 'Yemen Rial'},
                        {'code' : 'ZAR', 'name' : 'South Africa Rand'},
                        {'code' : 'ZMW', 'name' : 'Zambia Kwacha'},
                        {'code' : 'ZWD', 'name' : 'Zimbabwe Dollar'}
                    ]
                };

                function copyObject(source, target) {
                    var key;

                    target = target || (Array.isArray(source) ? [] : {});

                    for (key in source) {
                        if (source.hasOwnProperty(key)) {
                            target[key] = source[key] || target[key];
                        }
                    }

                    return target;
                }

                /** Get the data based on key**/
                Chance.prototype.get = function (name) {
                    return copyObject(data[name]);
                };

                /** Set the data as key and data or the data map**/
                Chance.prototype.set = function (name, values) {
                    if (typeof name === "string") {
                        data[name] = values;
                    } else {
                        data = copyObject(name, data);
                    }
                };


                Chance.prototype.mersenne_twister = function (seed) {
                    return new MersenneTwister(seed);
                };

                // -- End Miscellaneous --


                // Mersenne Twister from https://gist.github.com/banksean/300494
                var MersenneTwister = function (seed) {
                    if (seed === undefined) {
                        seed = new Date().getTime();
                    }
                    /* Period parameters */
                    this.N = 624;
                    this.M = 397;
                    this.MATRIX_A = 0x9908b0df;   /* constant vector a */
                    this.UPPER_MASK = 0x80000000; /* most significant w-r bits */
                    this.LOWER_MASK = 0x7fffffff; /* least significant r bits */

                    this.mt = new Array(this.N); /* the array for the state vector */
                    this.mti = this.N + 1; /* mti==N + 1 means mt[N] is not initialized */

                    this.init_genrand(seed);
                };

                /* initializes mt[N] with a seed */
                MersenneTwister.prototype.init_genrand = function (s) {
                    this.mt[0] = s >>> 0;
                    for (this.mti = 1; this.mti < this.N; this.mti++) {
                        s = this.mt[this.mti - 1] ^ (this.mt[this.mti - 1] >>> 30);
                        this.mt[this.mti] = (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253) + this.mti;
                        /* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
                        /* In the previous versions, MSBs of the seed affect   */
                        /* only MSBs of the array mt[].                        */
                        /* 2002/01/09 modified by Makoto Matsumoto             */
                        this.mt[this.mti] >>>= 0;
                        /* for >32 bit machines */
                    }
                };

                /* initialize by an array with array-length */
                /* init_key is the array for initializing keys */
                /* key_length is its length */
                /* slight change for C++, 2004/2/26 */
                MersenneTwister.prototype.init_by_array = function (init_key, key_length) {
                    var i = 1, j = 0, k, s;
                    this.init_genrand(19650218);
                    k = (this.N > key_length ? this.N : key_length);
                    for (; k; k--) {
                        s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
                        this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1664525) << 16) + ((s & 0x0000ffff) * 1664525))) + init_key[j] + j; /* non linear */
                        this.mt[i] >>>= 0; /* for WORDSIZE > 32 machines */
                        i++;
                        j++;
                        if (i >= this.N) { this.mt[0] = this.mt[this.N - 1]; i = 1; }
                        if (j >= key_length) { j = 0; }
                    }
                    for (k = this.N - 1; k; k--) {
                        s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
                        this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1566083941) << 16) + (s & 0x0000ffff) * 1566083941)) - i; /* non linear */
                        this.mt[i] >>>= 0; /* for WORDSIZE > 32 machines */
                        i++;
                        if (i >= this.N) { this.mt[0] = this.mt[this.N - 1]; i = 1; }
                    }

                    this.mt[0] = 0x80000000; /* MSB is 1; assuring non-zero initial array */
                };

                /* generates a random number on [0,0xffffffff]-interval */
                MersenneTwister.prototype.genrand_int32 = function () {
                    var y;
                    var mag01 = new Array(0x0, this.MATRIX_A);
                    /* mag01[x] = x * MATRIX_A  for x=0,1 */

                    if (this.mti >= this.N) { /* generate N words at one time */
                        var kk;

                        if (this.mti === this.N + 1) {   /* if init_genrand() has not been called, */
                            this.init_genrand(5489); /* a default initial seed is used */
                        }
                        for (kk = 0; kk < this.N - this.M; kk++) {
                            y = (this.mt[kk]&this.UPPER_MASK)|(this.mt[kk + 1]&this.LOWER_MASK);
                            this.mt[kk] = this.mt[kk + this.M] ^ (y >>> 1) ^ mag01[y & 0x1];
                        }
                        for (;kk < this.N - 1; kk++) {
                            y = (this.mt[kk]&this.UPPER_MASK)|(this.mt[kk + 1]&this.LOWER_MASK);
                            this.mt[kk] = this.mt[kk + (this.M - this.N)] ^ (y >>> 1) ^ mag01[y & 0x1];
                        }
                        y = (this.mt[this.N - 1]&this.UPPER_MASK)|(this.mt[0]&this.LOWER_MASK);
                        this.mt[this.N - 1] = this.mt[this.M - 1] ^ (y >>> 1) ^ mag01[y & 0x1];

                        this.mti = 0;
                    }

                    y = this.mt[this.mti++];

                    /* Tempering */
                    y ^= (y >>> 11);
                    y ^= (y << 7) & 0x9d2c5680;
                    y ^= (y << 15) & 0xefc60000;
                    y ^= (y >>> 18);

                    return y >>> 0;
                };

                /* generates a random number on [0,0x7fffffff]-interval */
                MersenneTwister.prototype.genrand_int31 = function () {
                    return (this.genrand_int32() >>> 1);
                };

                /* generates a random number on [0,1]-real-interval */
                MersenneTwister.prototype.genrand_real1 = function () {
                    return this.genrand_int32() * (1.0 / 4294967295.0);
                    /* divided by 2^32-1 */
                };

                /* generates a random number on [0,1)-real-interval */
                MersenneTwister.prototype.random = function () {
                    return this.genrand_int32() * (1.0 / 4294967296.0);
                    /* divided by 2^32 */
                };

                /* generates a random number on (0,1)-real-interval */
                MersenneTwister.prototype.genrand_real3 = function () {
                    return (this.genrand_int32() + 0.5) * (1.0 / 4294967296.0);
                    /* divided by 2^32 */
                };

                /* generates a random number on [0,1) with 53-bit resolution*/
                MersenneTwister.prototype.genrand_res53 = function () {
                    var a = this.genrand_int32()>>>5, b = this.genrand_int32()>>>6;
                    return (a * 67108864.0 + b) * (1.0 / 9007199254740992.0);
                };


                //// CommonJS module
                //if (typeof exports !== 'undefined') {
                //    if (typeof module !== 'undefined' && module.exports) {
                //        exports = module.exports = Chance;
                //    }
                //    exports.Chance = Chance;
                //}

                //// Register as an anonymous AMD module
                //if (typeof define === 'function' && define.amd) {
                //    define([], function () {
                //        return Chance;
                //    });
                //}

                // If there is a window object, that at least has a document property,
                // instantiate and define chance on the window
                //if (typeof window === "object" && typeof window.document === "object") {
                //    window.Chance = Chance;
                //    window.chance = new Chance();
                //}
                
                
                //document.write ( GenRandomSentence(), " " )

                function qrand(n) {

                    RandSeed = (RandMultiplier * RandSeed + RandIncrement) % 0x7fffffff

                    return (RandSeed >> 16) % n

                }



                function qinit() {

                    RandMultiplier = 0x015a4e35

                    RandIncrement = 1



                    // Initialize using the computer's date and time...

                    var now = new Date()

                    RandSeed = now.getTime() % 0xffffffff

                    FirstSentence = 1

                    FirstAmerica = 1

                }



                function GenRandomSentenceTemplate() {

                    // code key:  

                    //              0 = lone noun

                    //              1 = noun phrase

                    //              2 = transitive verb phrase (present tense, singular, third person)

                    //              3 = conjunction

                    //              4 = intransitive verb phrase

                    //              5 = transitive verb phrase (infinitive, singular)

                    //              6 = adjective

                    //              7 = adverb

                    var w = ""

                    var n = 17

                    var r = qrand(n+5)

                    if ( r > n )            w = "1 2 1."

                    else if ( r == 1 )      w = "1 2 1, 3 1 2 1."

                    else if ( r == 2 )      w = "When 1 4, 1 4."

                    else if ( r == 3 )      w = "If 1 2 1, then 1 4."

                    else if ( r == 4 )      w = "Sometimes 1 4, but 1 always 2 1!"

                    else if ( r == 5 )      w = "Most people believe that 1 2 1, but they need to remember how 7 1 4."

                    else if ( r == 6 ) {

                        if ( FirstAmerica ) {

                            FirstAmerica = 0

                            w = "1, 1, and 1 are what made America great!"

                        } else {

                            w = "1 2 1."

                        }

                    }

                    else if ( r == 7 )      w = "1 4, 3 1 2 1."

                    else if ( r == 8 )      w = "Now and then, 1 2 1."

                    else if ( r == 9 )      w = "1 4, and 1 4; however, 1 2 1."

                    else if ( r == 10 ) {

                        if ( FirstSentence ) {

                            w = "1 2 1."

                        } else {

                            w = "Indeed, 1 2 1."

                        }

                    }

                    else if ( r == 11 ) {

                        if ( FirstSentence ) {

                            w = "1 2 1."

                        } else {

                            w = "Furthermore, 1 4, and 1 2 1."

                        }

                    }

                    else if ( r == 12 ) {

                        if ( FirstSentence ) {

                            w = "1 2 1."

                        } else {

                            w = "For example, 1 indicates that 1 2 1."

                        }

                    }

                    else if ( r == 13 )     w = "When you see 1, it means that 1 4."

                    else if ( r == 14 )     w = "Any 0 can 5 1, but it takes a real 0 to 5 1."

                    else if ( r == 15 )     w = "1 is 6."

                    else if ( r == 16 )     w = "When 1 is 6, 1 2 1."

                    FirstSentence = 0

                    return w

                }





                function GenNoun() {

                    var n = 125

                    var r = qrand(n)

                    var w = ""

                    if ( r == 0 )           w = "cocker spaniel"

                    else if ( r == 1 )      w = "roller coaster"

                    else if ( r == 2 )      w = "abstraction"

                    else if ( r == 3 )      w = "pine cone"

                    else if ( r == 4 )      w = "microscope"

                    else if ( r == 5 )      w = "bottle of beer"

                    else if ( r == 6 )      w = "bowling ball"

                    else if ( r == 7 )      w = "grain of sand"

                    else if ( r == 8 )      w = "wheelbarrow"

                    else if ( r == 9 )      w = "pork chop"

                    else if ( r == 10 )     w = "bullfrog"

                    else if ( r == 11 )     w = "squid"

                    else if ( r == 12 )     w = "tripod"

                    else if ( r == 13 )     w = "girl scout"

                    else if ( r == 14 )     w = "light bulb"

                    else if ( r == 15 )     w = "hole puncher"

                    else if ( r == 16 )     w = "carpet tack"

                    else if ( r == 17 )     w = "submarine"

                    else if ( r == 18 )     w = "diskette"

                    else if ( r == 19 )     w = "tape recorder"

                    else if ( r == 20 )     w = "anomaly"

                    else if ( r == 21 )     w = "insurance agent"

                    else if ( r == 22 )     w = "mortician"

                    else if ( r == 23 )     w = "fire hydrant"

                    else if ( r == 24 )     w = "photon"

                    else if ( r == 25 )     w = "line dancer"

                    else if ( r == 26 )     w = "paper napkin"

                    else if ( r == 27 )     w = "stovepipe"

                    else if ( r == 28 )     w = "graduated cylinder"

                    else if ( r == 29 )     w = "hydrogen atom"

                    else if ( r == 30 )     w = "garbage can"

                    else if ( r == 31 )     w = "reactor"

                    else if ( r == 32 )     w = "power drill"

                    else if ( r == 33 )     w = "scooby snack"

                    else if ( r == 34 )     w = "freight train"

                    else if ( r == 35 )     w = "ocean"

                    else if ( r == 36 )     w = "bartender"

                    else if ( r == 37 )     w = "senator"

                    else if ( r == 38 )     w = "mating ritual"

                    else if ( r == 39 )     w = "briar patch"

                    else if ( r == 40 )     w = "jersey cow"

                    else if ( r == 41 )     w = "chain saw"

                    else if ( r == 42 )     w = "prime minister"

                    else if ( r == 43 )     w = "cargo bay"

                    else if ( r == 44 )     w = "buzzard"

                    else if ( r == 45 )     w = "polar bear"

                    else if ( r == 46 )     w = "tomato"

                    else if ( r == 47 )     w = "razor blade"

                    else if ( r == 48 )     w = "ball bearing"

                    else if ( r == 49 )     w = "fighter pilot"

                    else if ( r == 50 )     w = "support group"

                    else if ( r == 51 )     w = "fundraiser"

                    else if ( r == 52 )     w = "cowboy"

                    else if ( r == 53 )     w = "football team"

                    else if ( r == 54 )     w = "cab driver"

                    else if ( r == 55 )     w = "nation"

                    else if ( r == 56 )     w = "ski lodge"

                    else if ( r == 57 )     w = "mastadon"

                    else if ( r == 58 )     w = "recliner"

                    else if ( r == 59 )     w = "minivan"

                    else if ( r == 60 )     w = "deficit"

                    else if ( r == 61 )     w = "food stamp"

                    else if ( r == 62 )     w = "wedding dress"

                    else if ( r == 63 )     w = "fairy"

                    else if ( r == 64 )     w = "globule"

                    else if ( r == 65 )     w = "movie theater"

                    else if ( r == 66 )     w = "tornado"

                    else if ( r == 67 )     w = "rattlesnake"

                    else if ( r == 68 )     w = "CEO"

                    else if ( r == 69 )     w = "corporation"

                    else if ( r == 70 )     w = "plaintiff"

                    else if ( r == 71 )     w = "class action suit"

                    else if ( r == 72 )     w = "judge"

                    else if ( r == 73 )     w = "defendant"

                    else if ( r == 74 )     w = "dust bunny"

                    else if ( r == 75 )     w = "vacuum cleaner"

                    else if ( r == 76 )     w = "lover"

                    else if ( r == 77 )     w = "sandwich"

                    else if ( r == 78 )     w = "hockey player"

                    else if ( r == 79 )     w = "avocado pit"

                    else if ( r == 80 )     w = "fruit cake"

                    else if ( r == 81 )     w = "turkey"

                    else if ( r == 82 )     w = "sheriff"

                    else if ( r == 83 )     w = "apartment building"

                    else if ( r == 84 )     w = "industrial complex"

                    else if ( r == 85 )     w = "inferiority complex"

                    else if ( r == 86 )     w = "salad dressing"

                    else if ( r == 87 )     w = "short order cook"

                    else if ( r == 88 )     w = "pig pen"

                    else if ( r == 89 )     w = "grand piano"

                    else if ( r == 90 )     w = "tuba player"

                    else if ( r == 91 )     w = "traffic light"

                    else if ( r == 92 )     w = "turn signal"

                    else if ( r == 93 )     w = "paycheck"

                    else if ( r == 94 )     w = "blood clot"

                    else if ( r == 95 )     w = "earring"

                    else if ( r == 96 )     w = "blithe spirit"

                    else if ( r == 97 )     w = "customer"

                    else if ( r == 98 )     w = "warranty"

                    else if ( r == 99 )     w = "grizzly bear"

                    else if ( r == 100 )    w = "cyprus mulch"

                    else if ( r == 101 )    w = "pit viper"

                    else if ( r == 102 )    w = "crank case"

                    else if ( r == 103 )    w = "oil filter"

                    else if ( r == 104 )    w = "steam engine"

                    else if ( r == 105 )    w = "chestnut"

                    else if ( r == 106 )    w = "chess board"

                    else if ( r == 107 )    w = "pickup truck"

                    else if ( r == 108 )    w = "cheese wheel"

                    else if ( r == 109 )    w = "eggplant"

                    else if ( r == 110 )    w = "umbrella"

                    else if ( r == 111 )    w = "skyscraper"

                    else if ( r == 112 )    w = "dolphin"

                    else if ( r == 113 )    w = "asteroid"

                    else if ( r == 114 )    w = "parking lot"

                    else if ( r == 115 )    w = "demon"

                    else if ( r == 116 )    w = "tabloid"

                    else if ( r == 117 )    w = "particle accelerator"

                    else if ( r == 118 )    w = "cloud formation"

                    else if ( r == 119 )    w = "cashier"

                    else if ( r == 120 )    w = "burglar"

                    else if ( r == 121 )    w = "spider"

                    else if ( r == 122 )    w = "cough syrup"

                    else if ( r == 123 )    w = "satellite"

                    else if ( r == 124 )    w = "scythe"

                    return w

                }





                function GenPreposition() {

                    var n = 14

                    var r = qrand(n)

                    var w = ""

                    if ( r == 0 )           w = "of"

                    else if ( r == 1 )      w = "from"

                    else if ( r == 2 )      w = "near"

                    else if ( r == 3 )      w = "about"

                    else if ( r == 4 )      w = "around"

                    else if ( r == 5 )      w = "for"

                    else if ( r == 6 )      w = "toward"

                    else if ( r == 7 )      w = "over"

                    else if ( r == 8 )      w = "behind"

                    else if ( r == 9 )      w = "beyond"

                    else if ( r == 10 )     w = "related to"

                    else if ( r == 11 )     w = "defined by"

                    else if ( r == 12 )     w = "inside"

                    else if ( r == 13 )     w = "living with"

                    return w

                }





                function GenNounPhrase(depth) {

                    var phraseKind = qrand(3)

                    var s = ""

                    if ( phraseKind == 0 || depth>0 ) {

                        s = GenNoun()

                    } else if ( phraseKind == 1 ) {

                        s = GenAdjective() + " " + GenNoun()

                    } else if ( phraseKind == 2 ) {

                        s = GenNoun() + " " + GenPreposition() + " " + GenNounPhrase(depth+1)

                    }

                    var r = qrand(100)

                    if ( r < 30 ) {

                        s = "the " + s

                    } else if ( r < 35 ) {

                        s = "another " + s

                    } else if ( r < 40 ) {

                        s = "some " + s

                    } else {

                        var c = s.substring(0,1).toLowerCase()

                        if ( (s.substring(0,8) != "Eurasian") && 

                            (c=='a' || c=='e' || c=='i' || c=='o' || c=='u') ) {

                            s = "an " + s

                        } else {

                            s = "a " + s

                        }

                    }

                    return s

                }





                function GenAdverb() {

                    var n = 28

                    var r = qrand(n)

                    var s = ""

                    if ( r == 0 )           s = "knowingly"

                    else if ( r == 1 )      s = "slyly"

                    else if ( r == 2 )      s = "greedily"

                    else if ( r == 3 )      s = "hesitantly"

                    else if ( r == 4 )      s = "secretly"

                    else if ( r == 5 )      s = "carelessly"

                    else if ( r == 6 )      s = "thoroughly"

                    else if ( r == 7 )      s = "barely"

                    else if ( r == 8 )      s = "ridiculously"

                    else if ( r == 9 )      s = "non-chalantly"

                    else if ( r == 10 )     s = "hardly"

                    else if ( r == 11 )     s = "eagerly"

                    else if ( r == 12 )     s = "feverishly"

                    else if ( r == 13 )     s = "lazily"

                    else if ( r == 14 )     s = "inexorably"

                    else if ( r == 15 )     s = "accurately"

                    else if ( r == 16 )     s = "accidentally"

                    else if ( r == 17 )     s = "completely"

                    else if ( r == 18 )     s = "usually"

                    else if ( r == 19 )     s = "single-handledly"

                    else if ( r == 20 )     s = "underhandedly"

                    else if ( r == 21 )     s = "almost"

                    else if ( r == 22 )     s = "wisely"

                    else if ( r == 23 )     s = "ostensibly"

                    else if ( r == 24 )     s = "somewhat"

                    else if ( r == 25 )     s = "overwhelmingly"

                    else if ( r == 26 )     s = "seldom"

                    else if ( r == 27 )     s = "often"

                    return s

                }





                function GenAdjective() {

                    var n = 105

                    var r = qrand(n)

                    var w = ""

                    if ( r == 0 )           w = "slow"

                    else if ( r == 1 )      w = "surly"

                    else if ( r == 2 )      w = "gentle"

                    else if ( r == 3 )      w = "optimal"

                    else if ( r == 4 )      w = "treacherous"

                    else if ( r == 5 )      w = "loyal"

                    else if ( r == 6 )      w = "smelly"

                    else if ( r == 7 )      w = "ravishing"

                    else if ( r == 8 )      w = "annoying"

                    else if ( r == 9 )      w = "burly"

                    else if ( r == 10 )     w = "raspy"

                    else if ( r == 11 )     w = "moldy"

                    else if ( r == 12 )     w = "blotched"

                    else if ( r == 13 )     w = "federal"

                    else if ( r == 14 )     w = "phony"

                    else if ( r == 15 )     w = "magnificent"

                    else if ( r == 16 )     w = "alleged"

                    else if ( r == 17 )     w = "crispy"

                    else if ( r == 18 )     w = "gratifying"

                    else if ( r == 19 )     w = "elusive"

                    else if ( r == 20 )     w = "revered"

                    else if ( r == 21 )     w = "spartan"

                    else if ( r == 22 )     w = "righteous"

                    else if ( r == 23 )     w = "mysterious"

                    else if ( r == 24 )     w = "worldly"

                    else if ( r == 25 )     w = "cosmopolitan"

                    else if ( r == 26 )     w = "college-educated"

                    else if ( r == 27 )     w = "bohemian"

                    else if ( r == 28 )     w = "statesmanlike"

                    else if ( r == 29 )     w = "stoic"

                    else if ( r == 30 )     w = "hypnotic"

                    else if ( r == 31 )     w = "dirt-encrusted"

                    else if ( r == 32 )     w = "purple"

                    else if ( r == 33 )     w = "infected"

                    else if ( r == 34 )     w = "shabby"

                    else if ( r == 35 )     w = "tattered"

                    else if ( r == 36 )     w = "South American"

                    else if ( r == 37 )     w = "Alaskan"

                    else if ( r == 38 )     w = "overripe"

                    else if ( r == 39 )     w = "self-loathing"

                    else if ( r == 40 )     w = "frustrating"

                    else if ( r == 41 )     w = "rude"

                    else if ( r == 42 )     w = "pompous"

                    else if ( r == 43 )     w = "impromptu"

                    else if ( r == 44 )     w = "makeshift"

                    else if ( r == 45 )     w = "so-called"

                    else if ( r == 46 )     w = "proverbial"

                    else if ( r == 47 )     w = "molten"

                    else if ( r == 48 )     w = "wrinkled"

                    else if ( r == 49 )     w = "psychotic"

                    else if ( r == 50 )     w = "foreign"

                    else if ( r == 51 )     w = "familiar"

                    else if ( r == 52 )     w = "pathetic"

                    else if ( r == 53 )     w = "precise"

                    else if ( r == 54 )     w = "moronic"

                    else if ( r == 55 )     w = "polka-dotted"

                    else if ( r == 56 )     w = "varigated"

                    else if ( r == 57 )     w = "mean-spirited"

                    else if ( r == 58 )     w = "false"

                    else if ( r == 59 )     w = "linguistic"

                    else if ( r == 60 )     w = "temporal"

                    else if ( r == 61 )     w = "fractured"

                    else if ( r == 62 )     w = "dreamlike"

                    else if ( r == 63 )     w = "imaginative"

                    else if ( r == 64 )     w = "cantankerous"

                    else if ( r == 65 )     w = "obsequious"

                    else if ( r == 66 )     w = "twisted"

                    else if ( r == 67 )     w = "load bearing"

                    else if ( r == 68 )     w = "orbiting"

                    else if ( r == 69 )     w = "radioactive"

                    else if ( r == 70 )     w = "unstable"

                    else if ( r == 71 )     w = "outer"

                    else if ( r == 72 )     w = "nearest"

                    else if ( r == 73 )     w = "most difficult"

                    else if ( r == 74 )     w = "Eurasian"

                    else if ( r == 75 )     w = "hairy"

                    else if ( r == 76 )     w = "flabby"

                    else if ( r == 77 )     w = "soggy"

                    else if ( r == 78 )     w = "muddy"

                    else if ( r == 79 )     w = "salty"

                    else if ( r == 80 )     w = "highly paid"

                    else if ( r == 81 )     w = "greasy"

                    else if ( r == 82 )     w = "fried"

                    else if ( r == 83 )     w = "frozen"

                    else if ( r == 84 )     w = "boiled"

                    else if ( r == 85 )     w = "incinerated"

                    else if ( r == 86 )     w = "vaporized"

                    else if ( r == 87 )     w = "nuclear"

                    else if ( r == 88 )     w = "paternal"

                    else if ( r == 89 )     w = "childlike"

                    else if ( r == 90 )     w = "feline"

                    else if ( r == 91 )     w = "fat"

                    else if ( r == 92 )     w = "skinny"

                    else if ( r == 93 )     w = "green"

                    else if ( r == 94 )     w = "financial"

                    else if ( r == 95 )     w = "frightened"

                    else if ( r == 96 )     w = "fashionable"

                    else if ( r == 97 )     w = "resplendent"

                    else if ( r == 98 )     w = "flatulent"

                    else if ( r == 99 )     w = "mitochondrial"

                    else if ( r == 100 )    w = "overpriced"

                    else if ( r == 101 )    w = "snooty"

                    else if ( r == 102 )    w = "self-actualized"

                    else if ( r == 103 )    w = "miserly"

                    else if ( r == 104 )    w = "geosynchronous"



                    if ( qrand(10) > 7 ) {

                        w = GenAdverb() + " " + w

                    }



                    return w

                }



                // 'tense' is one of the following:

                //      0 = infinitive

                //      1 = present tense, third person singular

                function GenTransitiveVerbPhrase(tense) {

                    var n = 56

                    var r = qrand(n)

                    var s = ""

                    if ( r == 0 )           s = "eat$"

                    else if ( r == 1 )      s = "conquer$"

                    else if ( r == 2 )      s = "figure$ out"

                    else if ( r == 3 )      s = "know$"

                    else if ( r == 4 )      s = "teach*"

                    else if ( r == 5 )      s = "require$ assistance from"

                    else if ( r == 6 )      s = "pour$ freezing cold water on"

                    else if ( r == 7 )      s = "find$ lice on"

                    else if ( r == 8 )      s = "seek$"

                    else if ( r == 9 )      s = "ignore$"

                    else if ( r == 10 )     s = "dance$ with"

                    else if ( r == 11 )     s = "recognize$"

                    else if ( r == 12 )     s = "compete$ with"

                    else if ( r == 13 )     s = "reach* an understanding with"

                    else if ( r == 14 )     s = "negotiate$ a prenuptial agreement with"

                    else if ( r == 15 )     s = "assimilate$"

                    else if ( r == 16 )     s = "bestow$ great honor upon"

                    else if ( r == 17 )     s = "derive$ perverse satisfaction from"

                    else if ( r == 18 )     s = "steal$ pencils from"

                    else if ( r == 19 )     s = "tr& to seduce"

                    else if ( r == 20 )     s = "go* deep sea fishing with"

                    else if ( r == 21 )     s = "find$ subtle faults with"

                    else if ( r == 22 )     s = "laugh$ and drink$ all night with"

                    else if ( r == 23 )     s = "befriend$"

                    else if ( r == 24 )     s = "make$ a truce with"

                    else if ( r == 25 )     s = "give$ secret financial aid to"

                    else if ( r == 26 )     s = "brainwash*"

                    else if ( r == 27 )     s = "trade$ baseball cards with"

                    else if ( r == 28 )     s = "sell$ " + GenNounPhrase(0) + " to"

                    else if ( r == 29 )     s = "caricature$"

                    else if ( r == 30 )     s = "sanitize$"

                    else if ( r == 31 )     s = "satiate$"

                    else if ( r == 32 )     s = "organize$"

                    else if ( r == 33 )     s = "graduate$ from"

                    else if ( r == 34 )     s = "give$ lectures on morality to"

                    else if ( r == 35 )     s = "^ a change of heart about"

                    else if ( r == 36 )     s = "play$ pinochle with"

                    else if ( r == 37 )     s = "give$ a pink slip to"

                    else if ( r == 38 )     s = "share$ a shower with"

                    else if ( r == 39 )     s = "buy$ an expensive gift for"

                    else if ( r == 40 )     s = "cook$ cheese grits for"

                    else if ( r == 41 )     s = "take$ a peek at"

                    else if ( r == 42 )     s = "pee$ on"

                    else if ( r == 43 )     s = "write$ a love letter to"

                    else if ( r == 44 )     s = "fall$ in love with"

                    else if ( r == 45 )     s = "avoid$ contact with"

                    else if ( r == 46 )     s = ") a big fan of"

                    else if ( r == 47 )     s = "secretly admire$"

                    else if ( r == 48 )     s = "borrow$ money from"

                    else if ( r == 49 )     s = "operate$ a small fruit stand with"

                    else if ( r == 50 )     s = "throw$ " + GenNounPhrase(0) + " at"

                    else if ( r == 51 )     s = "bur&"

                    else if ( r == 52 )     s = "can be kind to"

                    else if ( r == 53 )     s = "learn$ a hard lesson from"

                    else if ( r == 54 )     s = "plan$ an escape from " + GenNounPhrase(0)

                    else if ( r == 55 )     s = "make$ love to"



                    vt = "" 

                    var i

                    for (i=0; i<s.length; i++ ) {

                        var c = s.substring(i,i+1)      

                        var w = c

                        if ( c == '$' ) {

                            if ( tense == 0 )               w = ""

                            else if ( tense == 1 )  w = "s"

                                } 

                        else if ( c == '*' ) {

                            if ( tense == 0 )               w = ""

                            else if ( tense == 1 )  w = "es"

                                }

                        else if ( c == ')' ) {

                            if ( tense == 0 )               w = "be"

                            else if ( tense == 1 )  w = "is"

                                }

                        else if ( c == '^' ) {

                            if ( tense == 0 )               w = "have"

                            else if ( tense == 1 )  w = "has"

                                }

                        else if ( c == '&' ) {

                            if ( tense == 0 )               w = "y"

                            else if ( tense == 1 )  w = "ies"

                                }

                        vt += w

                    }



                    if ( qrand(10) < 3 ) {

                        vt = GenAdverb() + " " + vt

                    }



                    return vt

                }





                function GenIntransitiveVerbPhrase() {

                    var n = 28

                    var r = qrand(n)

                    var s = ""

                    if ( r == 0 )           s = "leaves"

                    else if ( r == 1 )      s = "goes to sleep"

                    else if ( r == 2 )      s = "takes a coffee break"

                    else if ( r == 3 )      s = "hibernates"

                    else if ( r == 4 )      s = "reads a magazine"

                    else if ( r == 5 )      s = "self-flagellates"

                    else if ( r == 6 )      s = "meditates"

                    else if ( r == 7 )      s = "starts reminiscing about lost glory"

                    else if ( r == 8 )      s = "flies into a rage"

                    else if ( r == 9 )      s = "earns frequent flier miles"

                    else if ( r == 10 )     s = "sweeps the floor"

                    else if ( r == 11 )     s = "feels nagging remorse"

                    else if ( r == 12 )     s = "returns home"

                    else if ( r == 13 )     s = "rejoices"

                    else if ( r == 14 )     s = "prays"

                    else if ( r == 15 )     s = "procrastinates"

                    else if ( r == 16 )     s = "daydreams"

                    else if ( r == 17 )     s = "ceases to exist"

                    else if ( r == 18 )     s = "hides"

                    else if ( r == 19 )     s = "panics"

                    else if ( r == 20 )     s = "beams with joy"

                    else if ( r == 21 )     s = "laughs out loud"

                    else if ( r == 22 )     s = "gets stinking drunk"

                    else if ( r == 23 )     s = "wakes up"

                    else if ( r == 24 )     s = "hesitates"

                    else if ( r == 25 )     s = "trembles"

                    else if ( r == 26 )     s = "ruminates"

                    else if ( r == 27 )     s = "dies"

                    return s

                }





                function GenConjunction() {

                    var n = 4

                    var r = qrand(n)

                    var s = ""

                    if ( r == 0 )           s = "and"

                    else if ( r == 1 )      s = "or"

                    else if ( r == 2 )      s = "but"

                    else if ( r == 3 )      s = "because"

                    return s

                }





                function CapFirst(s) {

                    return s.substring(0,1).toUpperCase() + s.substring(1,s.length)

                }





                Chance.prototype.RandomSentence = function() {

                    var stemp = GenRandomSentenceTemplate()

                    var i

                    var s = ""

                    for ( i=0; i<stemp.length; i++ ) {

                        var c = stemp.substring(i,i+1)

                        var w = ""

                        if      ( c == '0' )    w = GenNoun()

                        else if ( c == '1' )    w = GenNounPhrase(0)

                        else if ( c == '2' )    w = GenTransitiveVerbPhrase(1)

                        else if ( c == '3' )    w = GenConjunction()

                        else if ( c == '4' )    w = GenIntransitiveVerbPhrase()

                        else if ( c == '5' )    w = GenTransitiveVerbPhrase(0)

                        else if ( c == '6' )    w = GenAdjective()

                        else if ( c == '7' )    w = GenAdverb()

                        else                            w = c

                        s += w

                    }

                    return CapFirst(s)

                }

                // If there is a window object, that at least has a document property,
                // instantiate and define chance on the window for testing.
                //if (typeof window === "object" && typeof window.document === "object") {
                //    window.Chance = Chance;
                //    window.chance = new Chance();
                //}
                
                
                return new Chance();
            })()
        });

