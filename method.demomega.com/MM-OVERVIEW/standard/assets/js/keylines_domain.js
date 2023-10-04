    //
    //     Copyright © 2011-2022 Cambridge Intelligence Limited. 
    //     All rights reserved.
    // 
    //     Sample Code
    //
    //!    Use rectangular combos to visualise IT networks.
    //import { data } from './arrangingitnetworks-data.js';
	import KeyLines from './esm/index.js';

    let chart;
    let graph;
    // Style info
    const backgroundColour = '#c9c9c9';
    const alertColour = '#e5309a';
    const selectedColour = '#EE86B3';
    const linkColour = '#EE86B3';
    const topLevelLinkColour = '#39bffd';
    // State tracking
    let alwaysRevealedLinks = [];
    // Find all the links that have alerts attached.
    function getAlertLinks() {
      const alerts = [];
      chart.each({ type: 'link' }, (link) => {
        // if (link.d.alert) {
          // alerts.push(link.id);
        // }
      });
      return alerts;
    }
    function decorateAlertLinks(linkIds) {
      chart.setProperties(linkIds.map(id => ({
        id,
        c: alertColour,
        g: [{
          c: alertColour,
          b: null,
          fi: { t: KeyLines.getFontIcon('fa-exclamation'), c: 'white' },
          e: 1.5
        }]
      })));
    }
    function showTraffic(linkIds) {
      const toForeground = {};
      const newLinkProperties = linkIds.map((id) => {
        toForeground[id] = true;
        const link = chart.getItem(id);
        // const c = link.d.alert ? alertColour : selectedColour;
        const c = selectedColour;
        return {
          id,
          c,
          // flow: link.d.flow
        };
      });
      chart.setProperties(newLinkProperties);
      const reveal = alwaysRevealedLinks.concat(linkIds);
      chart.combo().reveal(reveal);
      chart.foreground(link => toForeground[link.id], { type: 'link', items: 'underlying' });
    }
    function hideTraffic() {
      const revealedIds = chart.combo().reveal();
      chart.setProperties(revealedIds.map((id) => {
        const link = chart.getItem(id);
        return {
          id: link.id,
         // c: link.d.alert ? alertColour : linkColour,
          c: linkColour,
          flow: false
        };
      }));
      chart.combo().reveal(alwaysRevealedLinks);
    }
    function select(selections) {
      const itemId = selections.length > 0 ? selections[selections.length - 1] : null;
      const item = chart.getItem(itemId);
      if (item && item.type === 'node' && !chart.combo().isCombo(itemId)) {
        showTraffic(graph.neighbours(itemId, { all: true }).links);
      } else {
        chart.foreground(() => true);
      }
    }
    async function onDoubleClick({ id, preventDefault, button }) {
      if (!id || button !== 0) { return; }
      const api = chart.combo();
      const combo = api.isCombo(id) ? id : chart.getItem(id).parentId;
      const opts = { adapt: 'inCombo' };
      if (api.isCombo(combo)) {
        preventDefault();
        if (api.isOpen(combo)) {
          await api.close(combo, opts);
        } else {
          await api.open(combo, opts);
        }
        layout();
      }
    }
    function initialiseInteractions() {
      // perform layout on combo open/close
      chart.on('double-click', onDoubleClick);
      // reveal and foreground selected nodes and links
      chart.on('selection-change', () => {
        hideTraffic();
        select(chart.selection());
      });
    }
    function getFontIcons() {
      data.items.forEach((item) => {
        if (item.fi && item.fi.t) {
          item.fi.t = KeyLines.getFontIcon(item.fi.t);
        }
        if (item.g && item.g.length > 0 && item.g[0].fi && item.g[0].fi.t) {
          item.g[0].fi.t = KeyLines.getFontIcon(item.g[0].fi.t);
        }
      });
    }
    // generate a list of all combos ordered by how deeply nested they are
    function getComboList() {
      const comboIds = [];
      chart.each({ type: 'node', items: 'all' }, ({ id }) => {
        if (chart.combo().isCombo(id)) {
          comboIds.push(id);
        }
      });
      return comboIds;
    }
    async function openAllCombos() {
      const combosToOpen = getComboList();
      await chart.combo().open(combosToOpen, { animate: false });
      chart.combo().arrange(combosToOpen, { name: 'grid', animate: false });
    }
    function colourTopLevelLinks() {
      chart.each({ type: 'link', items: 'toplevel' }, ({ id }) => {
        chart.setProperties({ id, c: topLevelLinkColour });
      });
    }
	function isCombo(id) {
		return chart.combo().isCombo(id);
	}
	function defaultingNodes() {
		const props = [];
	  chart.each({items:'all', type: 'node' }, (item) => {
		  let temp = item.t.replace(" ","\n");
		  props.push(Object.assign({ id: item.id }, {'t': temp, c: '#79C4CE', oc :{b :'#3D8496', bw : '2'}})); // #31B672
		  if (isCombo(item.id)) 	{
				props.push(Object.assign({ id: item.id }, { sh : 'box', w : '4' }));
			}	else {
			props.push(Object.assign({ id: item.id }, {w : '0.5', e : '0.5', 'tc' : true, sh: 'circle'}));
			//props.push(Object.assign({ id: item.id }, {c: '#31B672', 'tc' : 'false'}));
		  }
	  });
	  chart.each({items:'all', type: 'link' }, (item) => {
		  props.push(Object.assign({ id: item.id }, {'d':{flow:'true'}, 'a2':'true', 'w':'2', fc : '#C8D8E0', fs : '10'}));
		  if (chart.combo().isCombo(item.id)) {
			  //chart.setProperties({ id: item.id, t: '' })
			  props.push(Object.assign({ id: item.id, t: '' , 'c' : '#C8D8E0' }))
		  } else {
			  props.push(Object.assign({ id: item.id , 'c' : '#EE86B3', 'fc' : '#EE86B3' }))
		  }
	  });
	  chart.setProperties(props, false);	
	}
    async function startKeyLines() {
      KeyLines.promisify();
      const options = {
        backColour: backgroundColour,
        backgroundAlpha: 0.45,
        combos: {
          shape: 'rectangle'
        },
        controlTheme: 'dark',
        linkStyle: {
          path: 'vertical'
        },
        selectedLink: {},
        selectedNode: {
          b: selectedColour,
          bw: 3
        },
        iconFontFamily: 'Font Awesome 5 Free Solid',
        handMode: true,
        imageAlignment: {}
      };
      function setIconSize(icon, size) {
        options.imageAlignment[KeyLines.getFontIcon(icon)] = { e: size };
      }
      setIconSize('fa-print', 0.8);
      setIconSize('fa-laptop', 0.75);
      setIconSize('fa-phone', 0.8);
      setIconSize('fa-server', 0.8);
      setIconSize('fa-sitemap', 0.75);
      options.imageAlignment[KeyLines.getFontIcon('fa-sitemap')].dy = -8;
      chart = await KeyLines.create({ container: 'klmm', options });
      initialiseInteractions();
      getFontIcons();
      // Use a graph engine to track relations in the underlying data
      graph = KeyLines.getGraphEngine();
      graph.load(data);
      chart.load(data);
      // reveal the links with alerts attached and make sure they stay that way
      alwaysRevealedLinks = getAlertLinks();
      chart.combo().reveal(alwaysRevealedLinks);
      // also style them dramatically...
      decorateAlertLinks(alwaysRevealedLinks);
      await openAllCombos();
	  defaultingNodes();
      colourTopLevelLinks();
      layout();
    }
    function layout() {
		console.log("in layout function");
      chart.layout('sequential', { level: 'level', tightness: 8, stretch: 0.78 , fit : true});
    }
    // function loadFontsAndStart() {
      // WebFont.load({
        // custom: {
          // families: ['Font Awesome 5 Free Solid']
        // },
         // active: startKeyLines,
         // inactive: startKeyLines
       // });
    // }
    // window.addEventListener('DOMContentLoaded', loadFontsAndStart);
    window.addEventListener('DOMContentLoaded', startKeyLines);