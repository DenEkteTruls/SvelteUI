
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.3' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\components\EditableEntry.svelte generated by Svelte v3.46.3 */
    const file$9 = "src\\components\\EditableEntry.svelte";

    // (48:0) {:else}
    function create_else_block$3(ctx) {
    	let div;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*value*/ ctx[0]);
    			attr_dev(div, "id", /*id*/ ctx[2]);
    			add_location(div, file$9, 48, 4, 1016);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*edit*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*value*/ 1) set_data_dev(t, /*value*/ ctx[0]);

    			if (dirty & /*id*/ 4) {
    				attr_dev(div, "id", /*id*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(48:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (44:0) {#if editing}
    function create_if_block$3(ctx) {
    	let form;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			input = element("input");
    			attr_dev(input, "id", /*id*/ ctx[2]);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "maxlength", "16");
    			input.required = /*required*/ ctx[1];
    			attr_dev(input, "class", "svelte-16gsuk0");
    			add_location(input, file$9, 45, 8, 901);
    			add_location(form, file$9, 44, 4, 830);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, input);
    			set_input_value(input, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[7]),
    					listen_dev(input, "blur", /*submit*/ ctx[5], false, false, false),
    					action_destroyer(focus.call(null, input)),
    					listen_dev(form, "submit", prevent_default(/*submit*/ ctx[5]), false, true, false),
    					listen_dev(form, "keydown", /*keydown*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*id*/ 4) {
    				attr_dev(input, "id", /*id*/ ctx[2]);
    			}

    			if (dirty & /*required*/ 2) {
    				prop_dev(input, "required", /*required*/ ctx[1]);
    			}

    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(44:0) {#if editing}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*editing*/ ctx[3]) return create_if_block$3;
    		return create_else_block$3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function focus(element) {
    	element.focus();
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EditableEntry', slots, []);
    	let { value, required = true } = $$props;
    	let editing = false, original;
    	let { id } = $$props;
    	const dispatch = createEventDispatcher();

    	onMount(() => {
    		original = value;
    	});

    	function edit() {
    		$$invalidate(3, editing = true);
    	}

    	function submit() {
    		if (value != original) {
    			dispatch('submit', value);
    		}

    		$$invalidate(3, editing = false);
    	}

    	function keydown(event) {
    		if (event.key == 'Escape') {
    			event.preventDefault();
    			$$invalidate(0, value = original);
    			$$invalidate(3, editing = false);
    		}
    	}

    	if (value == undefined) {
    		editing = true;
    	}

    	const writable_props = ['value', 'required', 'id'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EditableEntry> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('required' in $$props) $$invalidate(1, required = $$props.required);
    		if ('id' in $$props) $$invalidate(2, id = $$props.id);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onMount,
    		value,
    		required,
    		editing,
    		original,
    		id,
    		dispatch,
    		edit,
    		submit,
    		keydown,
    		focus
    	});

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('required' in $$props) $$invalidate(1, required = $$props.required);
    		if ('editing' in $$props) $$invalidate(3, editing = $$props.editing);
    		if ('original' in $$props) original = $$props.original;
    		if ('id' in $$props) $$invalidate(2, id = $$props.id);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, required, id, editing, edit, submit, keydown, input_input_handler];
    }

    class EditableEntry extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { value: 0, required: 1, id: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditableEntry",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !('value' in props)) {
    			console.warn("<EditableEntry> was created without expected prop 'value'");
    		}

    		if (/*id*/ ctx[2] === undefined && !('id' in props)) {
    			console.warn("<EditableEntry> was created without expected prop 'id'");
    		}
    	}

    	get value() {
    		throw new Error("<EditableEntry>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<EditableEntry>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get required() {
    		throw new Error("<EditableEntry>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set required(value) {
    		throw new Error("<EditableEntry>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<EditableEntry>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<EditableEntry>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Tab.svelte generated by Svelte v3.46.3 */
    const file$8 = "src\\components\\Tab.svelte";

    function create_fragment$8(ctx) {
    	let div3;
    	let div1;
    	let div0;
    	let t0;
    	let div2;
    	let h1;
    	let editableentry;
    	let updating_value;
    	let t1;
    	let p;
    	let t2_value = /*group*/ ctx[0].todos.length + "";
    	let t2;
    	let t3;
    	let t4_value = /*group*/ ctx[0].done + "";
    	let t4;
    	let t5;
    	let t6;
    	let img;
    	let img_src_value;
    	let current;
    	let mounted;
    	let dispose;

    	function editableentry_value_binding(value) {
    		/*editableentry_value_binding*/ ctx[5](value);
    	}

    	let editableentry_props = { id: "title_" };

    	if (/*group*/ ctx[0].title !== void 0) {
    		editableentry_props.value = /*group*/ ctx[0].title;
    	}

    	editableentry = new EditableEntry({
    			props: editableentry_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(editableentry, 'value', editableentry_value_binding));
    	editableentry.$on("submit", /*submit*/ ctx[1]('title'));

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div2 = element("div");
    			h1 = element("h1");
    			create_component(editableentry.$$.fragment);
    			t1 = space();
    			p = element("p");
    			t2 = text(t2_value);
    			t3 = text("/");
    			t4 = text(t4_value);
    			t5 = text(" tasks");
    			t6 = space();
    			img = element("img");
    			attr_dev(div0, "id", "color");
    			set_style(div0, "background-color", /*group*/ ctx[0].color);
    			attr_dev(div0, "class", "svelte-101p16q");
    			add_location(div0, file$8, 44, 8, 987);
    			attr_dev(div1, "class", "left svelte-101p16q");
    			add_location(div1, file$8, 43, 4, 959);
    			attr_dev(h1, "id", "title");
    			attr_dev(h1, "class", "svelte-101p16q");
    			add_location(h1, file$8, 47, 8, 1120);
    			attr_dev(p, "id", "tasks");
    			attr_dev(p, "class", "svelte-101p16q");
    			add_location(p, file$8, 48, 8, 1231);
    			if (!src_url_equal(img.src, img_src_value = "cross.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "id", "cross");
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-101p16q");
    			add_location(img, file$8, 49, 8, 1298);
    			attr_dev(div2, "class", "right svelte-101p16q");
    			add_location(div2, file$8, 46, 4, 1091);
    			attr_dev(div3, "class", "container svelte-101p16q");
    			add_location(div3, file$8, 42, 0, 910);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, h1);
    			mount_component(editableentry, h1, null);
    			append_dev(div2, t1);
    			append_dev(div2, p);
    			append_dev(p, t2);
    			append_dev(p, t3);
    			append_dev(p, t4);
    			append_dev(p, t5);
    			append_dev(div2, t6);
    			append_dev(div2, img);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*color_click*/ ctx[2], false, false, false),
    					listen_dev(img, "click", /*removeGroup*/ ctx[3], false, false, false),
    					listen_dev(div3, "click", /*tabClick*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*group*/ 1) {
    				set_style(div0, "background-color", /*group*/ ctx[0].color);
    			}

    			const editableentry_changes = {};

    			if (!updating_value && dirty & /*group*/ 1) {
    				updating_value = true;
    				editableentry_changes.value = /*group*/ ctx[0].title;
    				add_flush_callback(() => updating_value = false);
    			}

    			editableentry.$set(editableentry_changes);
    			if ((!current || dirty & /*group*/ 1) && t2_value !== (t2_value = /*group*/ ctx[0].todos.length + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*group*/ 1) && t4_value !== (t4_value = /*group*/ ctx[0].done + "")) set_data_dev(t4, t4_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editableentry.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editableentry.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(editableentry);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tab', slots, []);
    	let { group } = $$props;
    	let dispatch = createEventDispatcher();

    	function submit(field) {
    		return ({ detail: newValue }) => {
    			dispatch('nameChanged', { newName: newValue, id: group.id });
    		};
    	}

    	function color_click(event) {
    		dispatch('colorChanged', { id: group.id, new_color: "#fff" });
    	}

    	function removeGroup() {
    		dispatch('removeGroup', { id: group.id });
    	}

    	function tabClick(event) {
    		if (!["title_", "tasks", "color", "cross"].includes(event.target.id)) {
    			dispatch("selectedGroup", { id: group.id });
    		}
    	}

    	const writable_props = ['group'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tab> was created with unknown prop '${key}'`);
    	});

    	function editableentry_value_binding(value) {
    		if ($$self.$$.not_equal(group.title, value)) {
    			group.title = value;
    			$$invalidate(0, group);
    		}
    	}

    	$$self.$$set = $$props => {
    		if ('group' in $$props) $$invalidate(0, group = $$props.group);
    	};

    	$$self.$capture_state = () => ({
    		EditableEntry,
    		createEventDispatcher,
    		group,
    		dispatch,
    		submit,
    		color_click,
    		removeGroup,
    		tabClick
    	});

    	$$self.$inject_state = $$props => {
    		if ('group' in $$props) $$invalidate(0, group = $$props.group);
    		if ('dispatch' in $$props) dispatch = $$props.dispatch;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [group, submit, color_click, removeGroup, tabClick, editableentry_value_binding];
    }

    class Tab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { group: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tab",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*group*/ ctx[0] === undefined && !('group' in props)) {
    			console.warn("<Tab> was created without expected prop 'group'");
    		}
    	}

    	get group() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set group(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\TabList.svelte generated by Svelte v3.46.3 */
    const file$7 = "src\\components\\TabList.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (8:0) {#each groups as group}
    function create_each_block$2(ctx) {
    	let div;
    	let tab;
    	let current;

    	tab = new Tab({
    			props: { group: /*group*/ ctx[5] },
    			$$inline: true
    		});

    	tab.$on("nameChanged", /*nameChanged_handler*/ ctx[1]);
    	tab.$on("colorChanged", /*colorChanged_handler*/ ctx[2]);
    	tab.$on("removeGroup", /*removeGroup_handler*/ ctx[3]);
    	tab.$on("selectedGroup", /*selectedGroup_handler*/ ctx[4]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(tab.$$.fragment);
    			attr_dev(div, "class", "svelte-3e5qip");
    			add_location(div, file$7, 8, 4, 117);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(tab, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tab_changes = {};
    			if (dirty & /*groups*/ 1) tab_changes.group = /*group*/ ctx[5];
    			tab.$set(tab_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tab.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tab.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(tab);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(8:0) {#each groups as group}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*groups*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*groups*/ 1) {
    				each_value = /*groups*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TabList', slots, []);
    	let { groups } = $$props;
    	const writable_props = ['groups'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TabList> was created with unknown prop '${key}'`);
    	});

    	function nameChanged_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function colorChanged_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function removeGroup_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function selectedGroup_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('groups' in $$props) $$invalidate(0, groups = $$props.groups);
    	};

    	$$self.$capture_state = () => ({ Tab, groups });

    	$$self.$inject_state = $$props => {
    		if ('groups' in $$props) $$invalidate(0, groups = $$props.groups);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		groups,
    		nameChanged_handler,
    		colorChanged_handler,
    		removeGroup_handler,
    		selectedGroup_handler
    	];
    }

    class TabList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { groups: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabList",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*groups*/ ctx[0] === undefined && !('groups' in props)) {
    			console.warn("<TabList> was created without expected prop 'groups'");
    		}
    	}

    	get groups() {
    		throw new Error("<TabList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set groups(value) {
    		throw new Error("<TabList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\FilledButton.svelte generated by Svelte v3.46.3 */
    const file$6 = "src\\components\\FilledButton.svelte";

    function create_fragment$6(ctx) {
    	let button;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(/*value*/ ctx[0]);
    			attr_dev(button, "class", "svelte-n5zf15");
    			add_location(button, file$6, 16, 0, 230);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*clicked*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*value*/ 1) set_data_dev(t, /*value*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FilledButton', slots, []);
    	let { value } = $$props;
    	const dispatch = createEventDispatcher();

    	function clicked(event) {
    		dispatch('newGroup');
    	}

    	const writable_props = ['value'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FilledButton> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		value,
    		dispatch,
    		clicked
    	});

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, clicked];
    }

    class FilledButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { value: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FilledButton",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !('value' in props)) {
    			console.warn("<FilledButton> was created without expected prop 'value'");
    		}
    	}

    	get value() {
    		throw new Error("<FilledButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<FilledButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-progresscircle\src\index.svelte generated by Svelte v3.46.3 */

    const file$5 = "node_modules\\svelte-progresscircle\\src\\index.svelte";

    // (62:10)         
    function fallback_block(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*value*/ ctx[0]);
    			attr_dev(span, "class", "svelte-37ab2r");
    			add_location(span, file$5, 62, 6, 1373);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*value*/ 1) set_data_dev(t, /*value*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(62:10)         ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div1;
    	let svg;
    	let path0;
    	let path1;
    	let path1_d_value;
    	let t;
    	let div0;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			t = space();
    			div0 = element("div");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			attr_dev(path0, "d", "M50,5A45 45 0 1 1 49.9999 5");
    			attr_dev(path0, "class", "svelte-37ab2r");
    			add_location(path0, file$5, 57, 4, 1259);
    			attr_dev(path1, "d", path1_d_value = /*progressPath*/ ctx[1]());
    			attr_dev(path1, "class", "svelte-37ab2r");
    			add_location(path1, file$5, 58, 4, 1305);
    			attr_dev(svg, "viewBox", "0 0 100 100");
    			attr_dev(svg, "class", "svelte-37ab2r");
    			add_location(svg, file$5, 56, 2, 1226);
    			attr_dev(div0, "class", "svelte-37ab2r");
    			add_location(div0, file$5, 60, 2, 1348);
    			attr_dev(div1, "class", "svelte-37ab2r");
    			add_location(div1, file$5, 55, 0, 1217);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(div1, t);
    			append_dev(div1, div0);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*progressPath*/ 2 && path1_d_value !== (path1_d_value = /*progressPath*/ ctx[1]())) {
    				attr_dev(path1, "d", path1_d_value);
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && (!current || dirty & /*value*/ 1)) {
    					default_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let progressPath;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Src', slots, ['default']);
    	let { value = 0 } = $$props;
    	let { max = 100 } = $$props;
    	const writable_props = ['value', 'max'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Src> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('max' in $$props) $$invalidate(2, max = $$props.max);
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ value, max, progressPath });

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('max' in $$props) $$invalidate(2, max = $$props.max);
    		if ('progressPath' in $$props) $$invalidate(1, progressPath = $$props.progressPath);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value, max*/ 5) {
    			$$invalidate(1, progressPath = () => {
    				if (value <= 0) {
    					return "";
    				} else if (value >= max) {
    					return "M50,5A45 45 0 1 1 49.9999 5";
    				} else {
    					const angle = Math.PI * 2 * (value / max);
    					const x = 50 + Math.cos(angle - Math.PI / 2) * 45;
    					const y = 50 + Math.sin(angle - Math.PI / 2) * 45;
    					let path = "M50,5";

    					if (angle > Math.PI) {
    						path += "A45 45 0 0 1 50 95";
    					}

    					path += `A45 45 0 0 1 ${x} ${y}`;
    					return path;
    				}
    			});
    		}
    	};

    	return [value, progressPath, max, $$scope, slots];
    }

    class Src extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { value: 0, max: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Src",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get value() {
    		throw new Error("<Src>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Src>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<Src>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<Src>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\ProgressCircle.svelte generated by Svelte v3.46.3 */
    const file$4 = "src\\components\\ProgressCircle.svelte";

    // (22:0) {:else}
    function create_else_block_1(ctx) {
    	let div;
    	let processcircle;
    	let current;

    	processcircle = new Src({
    			props: {
    				id: "circle",
    				max: "100",
    				value: /*group*/ ctx[0].done / /*group*/ ctx[0].todos.length * 100,
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(processcircle.$$.fragment);
    			attr_dev(div, "class", "container svelte-g1cxph");
    			set_style(div, "--progress-color", /*group*/ ctx[0].color);
    			set_style(div, "border-radius", "100%");
    			set_style(div, "background-color", "#232229");
    			add_location(div, file$4, 22, 4, 637);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(processcircle, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const processcircle_changes = {};
    			if (dirty & /*group*/ 1) processcircle_changes.value = /*group*/ ctx[0].done / /*group*/ ctx[0].todos.length * 100;

    			if (dirty & /*$$scope, group*/ 5) {
    				processcircle_changes.$$scope = { dirty, ctx };
    			}

    			processcircle.$set(processcircle_changes);

    			if (!current || dirty & /*group*/ 1) {
    				set_style(div, "--progress-color", /*group*/ ctx[0].color);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(processcircle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(processcircle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(processcircle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(22:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (11:0) {#if !rounded}
    function create_if_block$2(ctx) {
    	let div;
    	let processcircle;
    	let current;

    	processcircle = new Src({
    			props: {
    				id: "circle",
    				max: "100",
    				value: /*group*/ ctx[0].done / /*group*/ ctx[0].todos.length * 100,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(processcircle.$$.fragment);
    			attr_dev(div, "class", "container svelte-g1cxph");
    			set_style(div, "--progress-color", /*group*/ ctx[0].color);
    			add_location(div, file$4, 11, 4, 143);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(processcircle, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const processcircle_changes = {};
    			if (dirty & /*group*/ 1) processcircle_changes.value = /*group*/ ctx[0].done / /*group*/ ctx[0].todos.length * 100;

    			if (dirty & /*$$scope, group*/ 5) {
    				processcircle_changes.$$scope = { dirty, ctx };
    			}

    			processcircle.$set(processcircle_changes);

    			if (!current || dirty & /*group*/ 1) {
    				set_style(div, "--progress-color", /*group*/ ctx[0].color);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(processcircle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(processcircle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(processcircle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(11:0) {#if !rounded}",
    		ctx
    	});

    	return block;
    }

    // (28:12) {:else}
    function create_else_block_2(ctx) {
    	let div;
    	let t0_value = Math.round(/*group*/ ctx[0].done / /*group*/ ctx[0].todos.length * 100) + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = text("%");
    			attr_dev(div, "id", "progress");
    			attr_dev(div, "class", "svelte-g1cxph");
    			add_location(div, file$4, 28, 16, 1032);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*group*/ 1 && t0_value !== (t0_value = Math.round(/*group*/ ctx[0].done / /*group*/ ctx[0].todos.length * 100) + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(28:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (26:12) {#if (group.tasks == 0 || group.done == 0)}
    function create_if_block_2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "0%";
    			attr_dev(div, "id", "progress");
    			attr_dev(div, "class", "svelte-g1cxph");
    			add_location(div, file$4, 26, 16, 966);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(26:12) {#if (group.tasks == 0 || group.done == 0)}",
    		ctx
    	});

    	return block;
    }

    // (24:8) <ProcessCircle id="circle" max="100" value={(group.done/group.todos.length)*100}>
    function create_default_slot_1(ctx) {
    	let div;
    	let t0_value = /*group*/ ctx[0].title + "";
    	let t0;
    	let t1;
    	let if_block_anchor;

    	function select_block_type_2(ctx, dirty) {
    		if (/*group*/ ctx[0].tasks == 0 || /*group*/ ctx[0].done == 0) return create_if_block_2;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			attr_dev(div, "id", "content");
    			attr_dev(div, "class", "svelte-g1cxph");
    			add_location(div, file$4, 24, 12, 854);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			insert_dev(target, t1, anchor);
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*group*/ 1 && t0_value !== (t0_value = /*group*/ ctx[0].title + "")) set_data_dev(t0, t0_value);

    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(24:8) <ProcessCircle id=\\\"circle\\\" max=\\\"100\\\" value={(group.done/group.todos.length)*100}>",
    		ctx
    	});

    	return block;
    }

    // (17:12) {:else}
    function create_else_block$2(ctx) {
    	let div;
    	let t0_value = Math.round(/*group*/ ctx[0].done / /*group*/ ctx[0].todos.length * 100) + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = text("%");
    			attr_dev(div, "id", "progress");
    			attr_dev(div, "class", "svelte-g1cxph");
    			add_location(div, file$4, 17, 16, 490);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*group*/ 1 && t0_value !== (t0_value = Math.round(/*group*/ ctx[0].done / /*group*/ ctx[0].todos.length * 100) + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(17:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (15:12) {#if (group.tasks == 0 || group.done == 0)}
    function create_if_block_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "0%";
    			attr_dev(div, "id", "progress");
    			attr_dev(div, "class", "svelte-g1cxph");
    			add_location(div, file$4, 15, 16, 424);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(15:12) {#if (group.tasks == 0 || group.done == 0)}",
    		ctx
    	});

    	return block;
    }

    // (13:8) <ProcessCircle id="circle" max="100" value={(group.done/group.todos.length)*100}>
    function create_default_slot(ctx) {
    	let div;
    	let t0_value = /*group*/ ctx[0].title + "";
    	let t0;
    	let t1;
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*group*/ ctx[0].tasks == 0 || /*group*/ ctx[0].done == 0) return create_if_block_1;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			attr_dev(div, "id", "content");
    			attr_dev(div, "class", "svelte-g1cxph");
    			add_location(div, file$4, 13, 12, 312);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			insert_dev(target, t1, anchor);
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*group*/ 1 && t0_value !== (t0_value = /*group*/ ctx[0].title + "")) set_data_dev(t0, t0_value);

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(13:8) <ProcessCircle id=\\\"circle\\\" max=\\\"100\\\" value={(group.done/group.todos.length)*100}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*rounded*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ProgressCircle', slots, []);
    	let { group } = $$props;
    	let { rounded } = $$props;
    	const writable_props = ['group', 'rounded'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ProgressCircle> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('group' in $$props) $$invalidate(0, group = $$props.group);
    		if ('rounded' in $$props) $$invalidate(1, rounded = $$props.rounded);
    	};

    	$$self.$capture_state = () => ({ ProcessCircle: Src, group, rounded });

    	$$self.$inject_state = $$props => {
    		if ('group' in $$props) $$invalidate(0, group = $$props.group);
    		if ('rounded' in $$props) $$invalidate(1, rounded = $$props.rounded);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [group, rounded];
    }

    class ProgressCircle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { group: 0, rounded: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProgressCircle",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*group*/ ctx[0] === undefined && !('group' in props)) {
    			console.warn("<ProgressCircle> was created without expected prop 'group'");
    		}

    		if (/*rounded*/ ctx[1] === undefined && !('rounded' in props)) {
    			console.warn("<ProgressCircle> was created without expected prop 'rounded'");
    		}
    	}

    	get group() {
    		throw new Error("<ProgressCircle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set group(value) {
    		throw new Error("<ProgressCircle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<ProgressCircle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<ProgressCircle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\ProgressCircleList.svelte generated by Svelte v3.46.3 */
    const file$3 = "src\\components\\ProgressCircleList.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (15:1) {:else}
    function create_else_block$1(ctx) {
    	let div;
    	let current;
    	let each_value_1 = /*groups*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "container svelte-1t7egeq");
    			add_location(div, file$3, 15, 4, 373);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*groups, rounded*/ 3) {
    				each_value_1 = /*groups*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(15:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (9:0) {#if !rounded}
    function create_if_block$1(ctx) {
    	let div;
    	let current;
    	let each_value = /*groups*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "container svelte-1t7egeq");
    			set_style(div, "border-radius", "16px");
    			set_style(div, "background-color", "#232229");
    			add_location(div, file$3, 9, 4, 156);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*groups, rounded*/ 3) {
    				each_value = /*groups*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(9:0) {#if !rounded}",
    		ctx
    	});

    	return block;
    }

    // (17:8) {#each groups as group}
    function create_each_block_1(ctx) {
    	let div;
    	let progresscircle;
    	let current;

    	progresscircle = new ProgressCircle({
    			props: {
    				group: /*group*/ ctx[2],
    				rounded: /*rounded*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(progresscircle.$$.fragment);
    			attr_dev(div, "class", "svelte-1t7egeq");
    			add_location(div, file$3, 17, 12, 443);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(progresscircle, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const progresscircle_changes = {};
    			if (dirty & /*groups*/ 1) progresscircle_changes.group = /*group*/ ctx[2];
    			progresscircle.$set(progresscircle_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progresscircle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progresscircle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(progresscircle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(17:8) {#each groups as group}",
    		ctx
    	});

    	return block;
    }

    // (11:8) {#each groups as group}
    function create_each_block$1(ctx) {
    	let div;
    	let progresscircle;
    	let current;

    	progresscircle = new ProgressCircle({
    			props: {
    				group: /*group*/ ctx[2],
    				rounded: /*rounded*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(progresscircle.$$.fragment);
    			attr_dev(div, "class", "svelte-1t7egeq");
    			add_location(div, file$3, 11, 12, 282);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(progresscircle, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const progresscircle_changes = {};
    			if (dirty & /*groups*/ 1) progresscircle_changes.group = /*group*/ ctx[2];
    			progresscircle.$set(progresscircle_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progresscircle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progresscircle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(progresscircle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(11:8) {#each groups as group}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*rounded*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ProgressCircleList', slots, []);
    	let { groups } = $$props;
    	let rounded = false;
    	const writable_props = ['groups'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ProgressCircleList> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('groups' in $$props) $$invalidate(0, groups = $$props.groups);
    	};

    	$$self.$capture_state = () => ({ ProgressCircle, groups, rounded });

    	$$self.$inject_state = $$props => {
    		if ('groups' in $$props) $$invalidate(0, groups = $$props.groups);
    		if ('rounded' in $$props) $$invalidate(1, rounded = $$props.rounded);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [groups, rounded];
    }

    class ProgressCircleList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { groups: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProgressCircleList",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*groups*/ ctx[0] === undefined && !('groups' in props)) {
    			console.warn("<ProgressCircleList> was created without expected prop 'groups'");
    		}
    	}

    	get groups() {
    		throw new Error("<ProgressCircleList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set groups(value) {
    		throw new Error("<ProgressCircleList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Todo.svelte generated by Svelte v3.46.3 */
    const file$2 = "src\\components\\Todo.svelte";

    // (20:0) {:else}
    function create_else_block(ctx) {
    	let div;
    	let h1;
    	let t_value = /*todo*/ ctx[0].todo + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			t = text(t_value);
    			attr_dev(h1, "class", "svelte-1tpwqce");
    			add_location(h1, file$2, 21, 8, 488);
    			attr_dev(div, "class", "container svelte-1tpwqce");
    			add_location(div, file$2, 20, 4, 436);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(h1, t);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*clicked*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*todo*/ 1 && t_value !== (t_value = /*todo*/ ctx[0].todo + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(20:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (16:0) {#if todo.checked}
    function create_if_block(ctx) {
    	let div;
    	let h1;
    	let t_value = /*todo*/ ctx[0].todo + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			t = text(t_value);
    			attr_dev(h1, "class", "svelte-1tpwqce");
    			add_location(h1, file$2, 17, 8, 389);
    			attr_dev(div, "class", "container checked svelte-1tpwqce");
    			add_location(div, file$2, 16, 4, 348);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(h1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*todo*/ 1 && t_value !== (t_value = /*todo*/ ctx[0].todo + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(16:0) {#if todo.checked}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*todo*/ ctx[0].checked) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Todo', slots, []);
    	let { todo } = $$props;
    	let { selectedGroup } = $$props;
    	let dispatch = createEventDispatcher();

    	function clicked(event) {
    		dispatch("checked", { id: todo.id, groupId: selectedGroup.id });
    	}

    	const writable_props = ['todo', 'selectedGroup'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Todo> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('todo' in $$props) $$invalidate(0, todo = $$props.todo);
    		if ('selectedGroup' in $$props) $$invalidate(2, selectedGroup = $$props.selectedGroup);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		todo,
    		selectedGroup,
    		dispatch,
    		clicked
    	});

    	$$self.$inject_state = $$props => {
    		if ('todo' in $$props) $$invalidate(0, todo = $$props.todo);
    		if ('selectedGroup' in $$props) $$invalidate(2, selectedGroup = $$props.selectedGroup);
    		if ('dispatch' in $$props) dispatch = $$props.dispatch;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [todo, clicked, selectedGroup];
    }

    class Todo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { todo: 0, selectedGroup: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Todo",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*todo*/ ctx[0] === undefined && !('todo' in props)) {
    			console.warn("<Todo> was created without expected prop 'todo'");
    		}

    		if (/*selectedGroup*/ ctx[2] === undefined && !('selectedGroup' in props)) {
    			console.warn("<Todo> was created without expected prop 'selectedGroup'");
    		}
    	}

    	get todo() {
    		throw new Error("<Todo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set todo(value) {
    		throw new Error("<Todo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedGroup() {
    		throw new Error("<Todo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedGroup(value) {
    		throw new Error("<Todo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\TodoList.svelte generated by Svelte v3.46.3 */
    const file$1 = "src\\components\\TodoList.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (8:4) {#each selectedGroup.todos as todo}
    function create_each_block(ctx) {
    	let todo;
    	let current;

    	todo = new Todo({
    			props: {
    				todo: /*todo*/ ctx[2],
    				selectedGroup: /*selectedGroup*/ ctx[0]
    			},
    			$$inline: true
    		});

    	todo.$on("checked", /*checked_handler*/ ctx[1]);

    	const block = {
    		c: function create() {
    			create_component(todo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(todo, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const todo_changes = {};
    			if (dirty & /*selectedGroup*/ 1) todo_changes.todo = /*todo*/ ctx[2];
    			if (dirty & /*selectedGroup*/ 1) todo_changes.selectedGroup = /*selectedGroup*/ ctx[0];
    			todo.$set(todo_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(todo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(todo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(todo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(8:4) {#each selectedGroup.todos as todo}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let current;
    	let each_value = /*selectedGroup*/ ctx[0].todos;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "container svelte-11ld828");
    			add_location(div, file$1, 6, 0, 95);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*selectedGroup*/ 1) {
    				each_value = /*selectedGroup*/ ctx[0].todos;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TodoList', slots, []);
    	let { selectedGroup } = $$props;
    	const writable_props = ['selectedGroup'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TodoList> was created with unknown prop '${key}'`);
    	});

    	function checked_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('selectedGroup' in $$props) $$invalidate(0, selectedGroup = $$props.selectedGroup);
    	};

    	$$self.$capture_state = () => ({ Todo, selectedGroup });

    	$$self.$inject_state = $$props => {
    		if ('selectedGroup' in $$props) $$invalidate(0, selectedGroup = $$props.selectedGroup);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selectedGroup, checked_handler];
    }

    class TodoList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { selectedGroup: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TodoList",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*selectedGroup*/ ctx[0] === undefined && !('selectedGroup' in props)) {
    			console.warn("<TodoList> was created without expected prop 'selectedGroup'");
    		}
    	}

    	get selectedGroup() {
    		throw new Error("<TodoList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedGroup(value) {
    		throw new Error("<TodoList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.46.3 */

    const { console: console_1 } = globals;
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let div4;
    	let div2;
    	let div0;
    	let tablist;
    	let t0;
    	let filledbutton;
    	let t1;
    	let div1;
    	let progresscirclelist;
    	let t2;
    	let todolist;
    	let t3;
    	let div3;
    	let current;

    	tablist = new TabList({
    			props: { groups: /*groups*/ ctx[0] },
    			$$inline: true
    		});

    	tablist.$on("nameChanged", /*changeGroupName*/ ctx[2]);
    	tablist.$on("colorChanged", /*changeGroupColor*/ ctx[4]);
    	tablist.$on("removeGroup", /*removeGroup*/ ctx[5]);
    	tablist.$on("selectedGroup", /*selectGroup*/ ctx[6]);

    	filledbutton = new FilledButton({
    			props: { value: "+ CREATE NEW GROUP" },
    			$$inline: true
    		});

    	filledbutton.$on("newGroup", /*newGroup*/ ctx[3]);

    	progresscirclelist = new ProgressCircleList({
    			props: { groups: /*groups*/ ctx[0] },
    			$$inline: true
    		});

    	todolist = new TodoList({
    			props: { selectedGroup: /*selectedGroup*/ ctx[1] },
    			$$inline: true
    		});

    	todolist.$on("checked", /*todoChecked*/ ctx[7]);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			create_component(tablist.$$.fragment);
    			t0 = space();
    			create_component(filledbutton.$$.fragment);
    			t1 = space();
    			div1 = element("div");
    			create_component(progresscirclelist.$$.fragment);
    			t2 = space();
    			create_component(todolist.$$.fragment);
    			t3 = space();
    			div3 = element("div");
    			attr_dev(div0, "class", "left");
    			add_location(div0, file, 100, 2, 2476);
    			attr_dev(div1, "class", "right");
    			add_location(div1, file, 104, 2, 2732);
    			attr_dev(div2, "class", "top svelte-1eympv");
    			add_location(div2, file, 99, 1, 2455);
    			attr_dev(div3, "class", "bottom");
    			add_location(div3, file, 109, 1, 2865);
    			attr_dev(div4, "class", "container svelte-1eympv");
    			add_location(div4, file, 98, 0, 2429);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div2);
    			append_dev(div2, div0);
    			mount_component(tablist, div0, null);
    			append_dev(div0, t0);
    			mount_component(filledbutton, div0, null);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			mount_component(progresscirclelist, div1, null);
    			append_dev(div1, t2);
    			mount_component(todolist, div1, null);
    			append_dev(div4, t3);
    			append_dev(div4, div3);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const tablist_changes = {};
    			if (dirty & /*groups*/ 1) tablist_changes.groups = /*groups*/ ctx[0];
    			tablist.$set(tablist_changes);
    			const progresscirclelist_changes = {};
    			if (dirty & /*groups*/ 1) progresscirclelist_changes.groups = /*groups*/ ctx[0];
    			progresscirclelist.$set(progresscirclelist_changes);
    			const todolist_changes = {};
    			if (dirty & /*selectedGroup*/ 2) todolist_changes.selectedGroup = /*selectedGroup*/ ctx[1];
    			todolist.$set(todolist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tablist.$$.fragment, local);
    			transition_in(filledbutton.$$.fragment, local);
    			transition_in(progresscirclelist.$$.fragment, local);
    			transition_in(todolist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tablist.$$.fragment, local);
    			transition_out(filledbutton.$$.fragment, local);
    			transition_out(progresscirclelist.$$.fragment, local);
    			transition_out(todolist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(tablist);
    			destroy_component(filledbutton);
    			destroy_component(progresscirclelist);
    			destroy_component(todolist);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	let groups = [
    		{
    			id: 0,
    			title: "General",
    			done: 0,
    			color: "#3069DF",
    			todos: [
    				{
    					id: 0,
    					todo: "Kaste søppel",
    					checked: false
    				},
    				{
    					id: 1,
    					todo: "Spasere med hunden",
    					checked: false
    				}
    			]
    		},
    		{
    			id: 1,
    			title: "Meetings",
    			done: 0,
    			color: "#FC7449",
    			todos: [
    				{
    					id: 0,
    					todo: "Påmelde teams",
    					checked: false
    				},
    				{
    					id: 1,
    					todo: "Snakke med Olaf",
    					checked: false
    				}
    			]
    		},
    		{
    			id: 2,
    			title: "Trip 1",
    			done: 0,
    			color: "#63F4F7",
    			todos: [
    				{
    					id: 0,
    					todo: "Pakke sekken",
    					checked: false
    				},
    				{
    					id: 1,
    					todo: "Sette opp teltet",
    					checked: false
    				},
    				{ id: 2, todo: "Spise", checked: false }
    			]
    		}
    	];

    	let selectedGroup = groups[0];

    	function changeGroupName(event) {
    		let id = event.detail.id;
    		let newName = event.detail.newName;

    		for (let i = 0; i < groups.length; i++) {
    			if (groups[i].id == id) {
    				$$invalidate(0, groups[i].title = newName, groups);
    				break;
    			}
    		}
    	}

    	function newGroup() {
    		$$invalidate(0, groups = [
    			...groups,
    			{
    				id: groups.length,
    				title: undefined,
    				done: 0,
    				color: "#3069DF",
    				todos: []
    			}
    		]);

    		console.log(groups);
    	}

    	function changeGroupColor(event) {
    		let id = event.detail.id;
    		let new_color = event.detail.new_color;

    		for (let i = 0; i < groups.length; i++) {
    			if (groups[i].id == id) {
    				$$invalidate(0, groups[i].color = new_color, groups);
    				break;
    			}
    		}
    	}

    	function removeGroup(event) {
    		let id = event.detail.id;
    		$$invalidate(0, groups = groups.filter(group => group.id != id));
    	}

    	function selectGroup(event) {
    		let id = event.detail.id;

    		for (let i = 0; i < groups.length; i++) {
    			if (groups[i].id == id) {
    				$$invalidate(1, selectedGroup = groups[i]);
    				break;
    			}
    		}
    	}

    	function todoChecked(event) {
    		let id = event.detail.id;
    		let groupId = event.detail.groupId;

    		for (let i = 0; i < groups.length; i++) {
    			if (groups[i].id == groupId) {
    				for (let x = 0; x < groups[i].todos.length; x++) {
    					if (groups[i].todos[x].id == id) {
    						$$invalidate(0, groups[i].todos[x].checked = true, groups);
    						$$invalidate(0, groups[i].done += 1, groups);
    						$$invalidate(0, groups);

    						for (let i = 0; i < groups.length; i++) {
    							if (groups[i].id == groupId) {
    								$$invalidate(1, selectedGroup = groups[i]);
    								break;
    							}
    						}
    					}
    				}
    			}
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		TabList,
    		FilledButton,
    		ProgressCircleList,
    		TodoList,
    		groups,
    		selectedGroup,
    		changeGroupName,
    		newGroup,
    		changeGroupColor,
    		removeGroup,
    		selectGroup,
    		todoChecked
    	});

    	$$self.$inject_state = $$props => {
    		if ('groups' in $$props) $$invalidate(0, groups = $$props.groups);
    		if ('selectedGroup' in $$props) $$invalidate(1, selectedGroup = $$props.selectedGroup);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		groups,
    		selectedGroup,
    		changeGroupName,
    		newGroup,
    		changeGroupColor,
    		removeGroup,
    		selectGroup,
    		todoChecked
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
