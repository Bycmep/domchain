"use strict";

/**
 * A framework of sorts to create UI out of webpage elements using DOM. Allows to chain methods to provide more concise code.
 */
export class Page {
    static #ids = [];
    /** @const { Page } Page object for document.body */
    static body = new Page();

    /**
     * @param { Element } element - a webpage element to start building from. If not specified, starts with document.body 
     * @param { Page } [parent] - parent object, used internally 
     */
    constructor(element, parent, svg) {
        if (element) {
            this.element = element;
            this.parent = parent;
            if (svg) this.svg = true;
        } else {
            this.element = document.body;
            this.parent = null;
        }
    }

    static #create(type, parent) {
        const tag = type.split('.');
        let tag0 = tag[0].toLowerCase();
        const svg = (parent.svg || tag0 == 'svg');
        const e = (svg)? 
            document.createElementNS("http://www.w3.org/2000/svg", tag0) :
            document.createElement(tag0);
        for (let i = 1; i < tag.length; i++) e.classList.add(tag[i]);
        return new Page(e, parent, svg);
    }

/**
     * Insert a new element inside this webpage element (after existing children)
     * @param { String } type - the element's type. Can have class(es) specified, separated by '.', ex.: 'div.class1.class2' 
     * @param { Map } [ attributes ] - the element's attributes and values to set for them
     * @returns { Page } the inserted object
     */
    insert(type, attributes) {
        const created = Page.#create(type, this);
        if (!this.child) this.child = [ created ];
        else this.child.push(created);
        this.element.appendChild(created.element);
        return created.set(attributes);
    }

    /**
     * Add a new element as the next sibling after this webpage element
     * @param { String } type - the element's type. Can have class(es) specified, separated by '.', ex.: 'div.class1.class2' 
     * @param { Map } [ attributes ] - the element's attributes and values to set for them
     * @returns { Page } the added object
     */
    append(type, attributes) {
        const created = Page.#create(type, this.parent);
        const index = this.parent.child.indexOf(this);
        if (index + 1 == this.parent.child.length) this.parent.element.appendChild(created.element);
        else this.parent.element.insertBefore(created.element, this.parent.child[index + 1].element);
        this.parent.child.splice(index + 1, 0, created);
        return created.set(attributes);
    }

    /**
     * Add a new element as a sibling before this webpage element
     * @param { String } type - the element's type. Can have class(es) specified, separated by '.', ex.: 'div.class1.class2' 
     * @param { Map } [ attributes ] - the element's attributes and values to set for them
     * @returns { Page } the added object
     */
    prepend(type, attributes) {
        const created = Page.#create(type, this.parent);
        const index = this.parent.child.indexOf(this);
        this.parent.child.splice(index, 0, created);
        this.parent.element.insertBefore(created.element, this.element);
        return created.set(attributes);
    }

    /**
     * Set values for attributes of this webpage element
     * @param { Map } attributes - keys for attribute names, values for their values. Can also add classes separated by '.', and style attributes (use 'style' key and a map for the value) 
     * @returns { Page } this object
     */
    set(attributes) {
        if (!attributes) return this;
        const e = this.element;
        for (const attribute in attributes) {
            const value = attributes[attribute];
            if (attribute == 'class') {
                const classes = value.split('.');
                for (const c of classes)
                    e.classList.add(c);
            } else if (attribute == 'style') {
                const values = value.split(';');
                for (const v of values) {
                    const vv = v.split(':');
                    if (vv.length > 1) 
                        e.style[vv[0]] = vv[1];
                }
            } else e[attribute] = value;
        }
        return this;
    }

    /**
     * Set values for style attributes of this webpage element
     * @param { Map } attributes - keys for style attribute names, values for their values 
     * @returns { Page } this object
     */
    style(attributes) {
        const e = this.element;
        for (const attribute in attributes) {
            const value = attributes[attribute];
            e.style[attribute] = value;
        }
        return this;
    }

    /**
     * Returns the object for the n-th child of this object
     * @param { number } num - number of the child (starting with 0). If negative, returns the n-th child from the end (ex.: -1 will give the last child)
     * @returns { Page } the child object
     */
    getChild(num) {
        if (num < 0) return this.child[this.child.length + num];
        return this.child[num];
    }

    /**
     * Returns the Element for the n-th child of this object
     * @param { number } num - number of the child (starting with 0). If negative, returns the n-th child from the end (ex.: -1 will give the last child)
     * @returns { Element } the child object's webpage element
     */
    geteChild(num) {
        return this.getChild(num).element;
    }

    /**
     * Returns the parent object that is n levels above this object
     * @param { number } [ n ] - the number of parents to go back. If not specified, returns the immediate parent
     * @returns { Page } n-th parent of this object
     */
    up(n) {
        let r = this;
        if (!n) n = 1;
        for (let i = 0; i < n; i++) r = r.parent;
        return r;
    }

    /**
     * Adds a class to the object's webpage element
     * @param { String } classname 
     * @returns { Page } this object
     */
    class(classname) {
        this.element.classList.add(classname);
        return this;
    }

    /**
     * Removes a class to the object's webpage element
     * @param { String } classname 
     * @returns { Page } this object
     */
    declass(classname) {
        if (!classname) this.element.removeAttribute('class');
        else this.element.classList.remove(classname);
        return this;
    }

    /**
     * Assigns an ID (static) to refer to the object later. Will overwrite any existing value for that ID
     * @param { String } id - a string to reference the object. Not related to the id of the webpage element
     * @returns { Page } this object
     */
    id(id) {
        Page.#ids[id] = this;
        return this;
    }

    /**
     * Gets an object by its ID
     * @param { String } id of the object set by id() method
     * @returns { Page } the object
     */
    static get(id) {
        return Page.#ids[id];
    }

    /**
     * Gets the webpage element of an object with a given ID
     * @param { String } id of the object set by id() method
     * @returns { Element } the webpage element of the object
     */
    static gete(id) {
        return Page.#ids[id].element;
    }

    /**
     * Get boundaries of the object relative to page, not window 
     * @returns { top, bottom, left, right, width, height } of the object
     */
    getBox() {
        return Page.getBox(this.element);
    }
    static getBox(e) {
        const b = e.getBoundingClientRect();
        return({ top: b.top + window.scrollY, bottom: b.bottom + window.scrollY,
            left: b.left + window.scrollX, right: b.right + window.scrollX,
            height: b.bottom - b.top, width: b.right - b.left });
    }
    /**
     * Get boundaries of the object inner area, relative to page, not window 
     * @returns { top, bottom, left, right, width, height } of the object
     */
    getBoxInner() {
        return Page.getBoxInner(this.element);
    }
    static getBoxInner(e) {
        const b = e.getBoundingClientRect();
        const s = getComputedStyle(e);
        const paddingTop = parseFloat(s.paddingTop);
        const paddingBottom = parseFloat(s.paddingBottom);
        const paddingLeft = parseFloat(s.paddingLeft);
        const paddingRight = parseFloat(s.paddingRight);
        return({ top: b.top + window.scrollY + paddingTop,
            bottom: b.bottom + window.scrollY - paddingBottom,
            left: b.left + window.scrollX + paddingLeft,
            right: b.right + window.scrollX - paddingRight,
            height: b.bottom - b.top - paddingTop - paddingBottom,
            width: b.right - b.left - paddingLeft - paddingRight});
    }

    /**
     * Sets HTML content for the object
     * @param { String } value 
     * @returns { Page } this object
     */
    html(value) {
        this.element.innerHTML = value;
        return this;
    }

    /**
     * Sets text content for the object
     * @param { String } value 
     * @returns { Page } this object
     */
    text(value) {
        this.element.innerText = value;
        return this;
    }

    /**
     * Activates the object on page
     * @returns { Page } this object
     */
    focus() {
        this.element.focus();
        return this;
    }

    /**
     * Deactivates the object on page
     * @returns { Page } this object
     */
    blur() {
        this.element.blur();
        return this;
    }

    /**
     * Returns the object that corresponds to a given webpage element
     * @param { Element } element - the webpage element to find the object for
     * @returns { Page } the found object, or false if not found
     */
    find(element) {
        if (this.element == element) return this;
        if (this.child)
            for (const child of this.child) {
                const found = child.find(element);
                if (found) return(found);
            }
        return false;
    }

    /**
     * Clears everything inside this object
     * @returns { Page } this object
     */
    clear() {
        this.element.innerHTML = "";
        this.child = undefined;
        return this;
    }

    /**
     * Removes this object
     */
    remove() {
        this.element.remove();
        if (this.parent) {
            const index = this.parent.child.indexOf(this);
            if(index != -1) {
                this.parent.child.splice(index, 1);
            }
        }
    }

    /**
     * Sets the object's webpage element style with a css text string
     * @param { String } csstext - inline css to assign to the webpage element 
     * @returns { Page } this object
     */
    css(csstext) {
        this.element.style.cssText = csstext;
        return this;
    }

    /**
     * Adds css style element with given content to the web page (head)
     * @param { String } css - stylesheet to add
     * @returns { Element } the stylesheet element
     */
    static injectCSS(css) {
        const style = document.createElement("style");
        style.textContent = css;
        document.head.appendChild(style);
        return style;
    }

    /**
     * Returns Page object that represents the shadow root of the element, creates if required.
     * It is special, so fewer methods are expected to work for it.
     * @param { Map } parameters - passed to attachShadow method
     * @returns { Page } the shadow root
     */
    shadowRoot(parameters) {
        if (!this.shadow) {
            const root = this.element.attachShadow(parameters);
            this.shadow = new Page(root, this, this.svg);
        }
        return this.shadow;
    }

    /**
     * Parses a structure of web elements presented as a string inside this element.
     * The syntax is better researched with examples.
     * @param { String } text - representation to parse
     * @returns { Page } this object
     */
    parse(text) {
        let quote = false;
        const quoted = (c) => {
            if (quote) { if (c == quote) quote = false; return true; }
            else if (c == "'" || c == '"') { quote = c; return true; }
            return false;
        };

        let pair = 0, open = [], stack = [], close = [];
        for (let i = 0; i < text.length; i++) {
            const c = text.charAt(i);
            if (!quoted(c)) {
                if (c == '{') { open[pair] = i; stack.push(pair); pair++; }
                else if (c == '}') {
                    const closing = stack.pop();
                    if (closing === undefined) {
                        console.error(`Parse: '{' expected.`); return;
                    }
                    close[closing] = i;
                }
            }
        }
        if (stack.pop() !== undefined) { console.error(`Parse: '}' expected.`); return; }

        const parse2 = (parent, head) => {
            const TAG = 0, PARAM = 1, TEXT = 2, ID = 3, WSPACE = -1, NA = -2;
            const content = [ "", "", "", "" ];
            let obj = null;
            const createElement = _ => {
                const unquote = (s) => {
                    const c = s.charAt(0), cc = s.charAt(s.length - 1);
                    if (c == '\'' || c == '"')
                        if (c == cc)
                            return s.substring(1, s.length - 1);
                    return s;
                };

                const tag = content[TAG].split('.');
                const tag0 = tag[0].toLowerCase();
                if (["checkbox", "radio", "text", "number", "password", "url"].includes(tag0)) {
                    if (content[PARAM]) content[PARAM] += ",";
                    content[PARAM] += `type:${tag0}`;
                    tag[0] = "input";
                    content[TAG] = tag.join(".");
                }
                obj = parent.insert(content[TAG]); content[TAG] = "";
                if (content[PARAM]) {
                    const KEY = 0, VALUE = 1, pair = [ "", "" ], map = {};
                    const store = _ => {
                        const key = unquote(pair[KEY].trim());
                        const value = unquote(pair[VALUE].trim());
                        if (key) map[key] = value;
                        pair[KEY] = ""; pair[VALUE] = ""; m = KEY;
                    }
                    let m = KEY;
                    for (const c of content[PARAM]) {
                        if (quoted(c)) pair[m] += c;
                        else if (c == ':' && m == KEY) m = VALUE;
                        else if (c == ',' && m == VALUE) store();
                        else pair[m] += c;
                    }
                    store();
                    obj.set(map); content[PARAM] = "";
                }
                if (content[TEXT]) {
                    obj.html(unquote(content[TEXT].trim())); content[TEXT] = "";
                }
                if (content[ID]) { obj.id(content[ID]); content[ID] = ""; }
                mode = WSPACE;
            }

            let i = 0, mode = TAG;
            while (i < head.length) {
                const c = head.charAt(i++);
                if (quoted(c)) content[mode] += c; 
                else if (c <= ' ' && (mode == TAG || mode == ID || mode == NA )) createElement();
                else if (c == '<' && (mode == TAG || mode == ID || mode == NA)) mode = PARAM;
                else if (c == '>' && mode == PARAM) mode = NA;
                else if (c == '(' && (mode == TAG || mode == ID || mode == NA)) mode = TEXT;
                else if (c == ')' && mode == TEXT) mode = NA;
                else if (c == '#' && (mode == TAG || mode == NA)) mode = ID;
                else if (mode == WSPACE && c > ' ') { mode = TAG; content[TAG] += c; }
                else content[mode] += c;
            }
            createElement();
            return obj;
        };

        const parse1 = (parent, start, end) => {
            let pos = start;
            while (pos < end) {
                let i;
                for (i = 0; i < open.length; i++) if (open[i] > pos) break;
                if (i < open.length && open[i] > end) i = open.length;
                const head = (i < open.length)? text.substring(pos, open[i]).trim() :
                    text.substring(pos, end).trim();
                let obj = parent;
                if (head) obj = parse2(parent, head);
                if (i < open.length) {
                    parse1(obj, open[i] + 1, close[i]);
                    pos = close[i] + 1;
                } else pos = end;
            }
        }            
        parse1(this, 0, text.length);
        return this;
    }
}
