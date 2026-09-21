/**
 * Social Chat Generator — shared engine.
 *
 * Factory, not a singleton: the same code backs the standalone page at
 * /tools/social-chat-generator.html and any future host. Modal open/close is
 * deliberately NOT here — that is page chrome, not tool logic.
 *
 * Required markup (ids, inside `root`):
 *   #tabWa #tabIg #waChatScreen #chatHeader #waChatBody #subStatus #avatarBg
 *   #avatarInitial #avatarUpload #verifiedToggle #verifiedBadge #waContactName
 *   #waPreviewName #themBtnLabel #waMsgInput #waTime #addThemBtn #addMeBtn
 *   #downloadWaBtn
 * Optional:
 *   [data-ts-result-actions] — revealed once the chat has content.
 *
 * Requires the html2canvas library to be loaded by the host page; the export
 * button degrades to a toast if it is missing.
 *
 * For entertainment only: the exported image is a mockup, not a real capture.
 */
(function (window, document) {
  'use strict';

  /**
   * The mockup is a picture of a phone, not UI chrome, so every colour in it is
   * an arbitrary value (bg-[#...]) rather than a Tailwind gray. That keeps it
   * pixel-identical in light and dark mode — the site-wide light-theme layer in
   * toolstack.css only remaps the theme-aware gray utilities.
   */
  var WA = {
    screen: 'bg-[#0b141a] rounded-xl overflow-hidden border border-gray-800 shadow-inner flex flex-col h-[380px]',
    header: 'bg-[#202c33] px-3 py-2.5 flex items-center gap-3 text-[#e9edef] border-b border-gray-800',
    avatar: 'w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs text-white overflow-hidden bg-cover bg-center',
    meta: 'text-[10px] text-emerald-400 mt-0.5',
    metaText: 'online',
    bubbleMe: 'bg-[#005c4b] text-[#e9edef]',
    bubbleThem: 'bg-[#202c33] text-[#e9edef]',
    bubbleTime: 'text-[#8696a0]',
    bubbleShape: 'rounded-lg px-2.5 py-1.5 max-w-[80%] shadow'
  };

  var IG = {
    screen: 'bg-black rounded-xl overflow-hidden border border-gray-800 shadow-inner flex flex-col h-[380px]',
    header: 'bg-[#1a1a1a] px-3 py-2.5 flex items-center gap-3 text-white border-b border-gray-800',
    avatar: 'w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white overflow-hidden bg-cover bg-center p-[2px]',
    meta: 'text-[10px] text-[#8e8e8e] mt-0.5',
    metaText: 'Active now',
    bubbleMe: 'bg-gradient-to-r from-purple-600 to-blue-500 text-white font-normal',
    bubbleThem: 'bg-[#262626] text-white',
    bubbleTime: 'text-[#8e8e8e]',
    bubbleShape: 'rounded-2xl px-3 py-1.5 max-w-[80%]'
  };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function createSocialChatGenerator(root) {
    if (!root) return null;

    var $ = function (id) { return root.querySelector('#' + id); };

    var tabWa = $('tabWa');
    var tabIg = $('tabIg');
    var chatScreen = $('waChatScreen');
    var chatHeader = $('chatHeader');
    var chatBody = $('waChatBody');
    var subStatus = $('subStatus');
    var avatarBg = $('avatarBg');
    var avatarInitial = $('avatarInitial');
    var avatarUpload = $('avatarUpload');
    var verifiedToggle = $('verifiedToggle');
    var verifiedBadge = $('verifiedBadge');
    var contactName = $('waContactName');
    var previewName = $('waPreviewName');
    var themBtnLabel = $('themBtnLabel');
    var msgInput = $('waMsgInput');
    var timeInput = $('waTime');
    var addThemBtn = $('addThemBtn');
    var addMeBtn = $('addMeBtn');
    var downloadBtn = $('downloadWaBtn');

    if (!chatScreen || !chatBody) return null;

    var platform = 'wa';

    var actionsEl = root.querySelector('[data-ts-result-actions]');
    var actionsShown = false;

    function revealActions() {
      if (actionsShown || !actionsEl) return;
      actionsShown = true;
      if (window.ToolStack) {
        window.ToolStack.reveal(actionsEl);
      } else {
        actionsEl.classList.remove('hidden');
      }
    }

    function applyPlatform(next) {
      platform = next;
      var theme = platform === 'wa' ? WA : IG;

      if (tabWa && tabIg) {
        tabWa.className = platform === 'wa'
          ? 'flex-1 py-2 bg-brand-500 text-gray-950 font-bold text-xs rounded-lg transition'
          : 'flex-1 py-2 text-gray-400 hover:text-gray-200 font-bold text-xs rounded-lg transition';
        tabIg.className = platform === 'ig'
          ? 'flex-1 py-2 bg-brand-500 text-gray-950 font-bold text-xs rounded-lg transition'
          : 'flex-1 py-2 text-gray-400 hover:text-gray-200 font-bold text-xs rounded-lg transition';
      }

      chatScreen.className = theme.screen;
      chatHeader.className = theme.header;

      // A custom avatar wins over the platform tint, so only restyle the
      // fallback when the user has not uploaded one.
      if (avatarBg && !avatarBg.style.backgroundImage) avatarBg.className = theme.avatar;

      if (subStatus) {
        subStatus.textContent = theme.metaText;
        subStatus.className = theme.meta;
      }
    }

    if (tabWa) tabWa.addEventListener('click', function () { applyPlatform('wa'); });
    if (tabIg) tabIg.addEventListener('click', function () { applyPlatform('ig'); });

    // --- contact details --------------------------------------------------

    if (avatarUpload && avatarBg) {
      avatarUpload.addEventListener('change', function (e) {
        var file = e.target.files && e.target.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = function (evt) {
          avatarBg.style.backgroundImage = "url('" + evt.target.result + "')";
          if (avatarInitial) avatarInitial.classList.add('hidden');
        };
        reader.readAsDataURL(file);
      });
    }

    if (verifiedToggle && verifiedBadge) {
      verifiedToggle.addEventListener('change', function (e) {
        verifiedBadge.classList.toggle('hidden', !e.target.checked);
      });
    }

    if (contactName) {
      contactName.addEventListener('input', function (e) {
        var val = e.target.value || 'Contact';
        if (previewName) previewName.textContent = val;
        if (themBtnLabel) themBtnLabel.textContent = val;
        if (avatarInitial && !(avatarBg && avatarBg.style.backgroundImage)) {
          avatarInitial.textContent = val.charAt(0).toUpperCase();
        }
      });
    }

    // --- messages ---------------------------------------------------------

    function appendMessage(isMe) {
      if (!msgInput) return;

      var text = msgInput.value.trim();
      if (!text) return;

      var time = (timeInput && timeInput.value) || '10:42 AM';
      var row = document.createElement('div');
      row.className = 'flex ' + (isMe ? 'justify-end' : 'justify-start');

      // Message text is user-supplied and inserted with innerHTML, so it is
      // escaped — otherwise pasting markup would inject live nodes into the
      // preview and into the exported PNG.
      var safe = escapeHtml(text);
      var theme = platform === 'wa' ? WA : IG;
      var bubble = isMe ? theme.bubbleMe : theme.bubbleThem;

      row.innerHTML =
        '<div class="' + bubble + ' ' + theme.bubbleShape + '">' +
          '<p class="leading-relaxed">' + safe + '</p>' +
          (platform === 'wa'
            ? '<span class="text-[9px] ' + theme.bubbleTime + ' block text-right mt-0.5">' + escapeHtml(time) + '</span>'
            : '') +
        '</div>';

      chatBody.appendChild(row);
      msgInput.value = '';
      chatBody.scrollTop = chatBody.scrollHeight;

      if (window.ToolStack) window.ToolStack.track('tool_output', { tool: 'social-chat-generator' });
      revealActions();
    }

    if (addThemBtn) {
      addThemBtn.addEventListener('click', function (e) {
        e.preventDefault();
        appendMessage(false);
      });
    }

    if (addMeBtn) {
      addMeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        appendMessage(true);
      });
    }

    if (msgInput) {
      msgInput.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          appendMessage(true);
        }
      });
    }

    // --- export -----------------------------------------------------------

    if (downloadBtn) {
      downloadBtn.addEventListener('click', function () {
        if (typeof window.html2canvas === 'undefined') {
          if (window.ToolStack) {
            window.ToolStack.toast('Export library unavailable — check your connection.');
          }
          return;
        }

        if (!chatBody.children.length) {
          if (window.ToolStack) window.ToolStack.toast('Add a message first.');
          return;
        }

        window.html2canvas(chatScreen, {
          scale: 3,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          logging: false
        }).then(function (canvas) {
          var link = document.createElement('a');
          link.download = platform + '-hd-chat-' + Date.now() + '.png';
          link.href = canvas.toDataURL('image/png', 1.0);
          link.click();
        });

        revealActions();
      });
    }

    applyPlatform('wa');

    return {
      appendMessage: appendMessage,
      setPlatform: applyPlatform,
      revealActions: revealActions
    };
  }

  window.ToolStackTools = window.ToolStackTools || {};
  window.ToolStackTools.createSocialChatGenerator = createSocialChatGenerator;
})(window, document);
