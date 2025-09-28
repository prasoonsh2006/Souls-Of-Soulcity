document.addEventListener("DOMContentLoaded", () => {
    const footerCredit = document.getElementById("footer-credit");
    footerCredit.style.fontSize = "1rem";
    const inviteUrl = 'https://discord.gg/TcngcJfhqt';
    footerCredit.innerHTML = `
          <style>
          @media (max-width:620px){
            .hide-on-sm { display:none !important; }
          }
          </style>
          <span class="hide-on-sm" style="display:inline">
          Initiative by <a id="paskall-link" href="https://www.youtube.com/@PasKaLL" target="_blank" rel="noopener noreferrer" style="color:inherit; text-decoration:none;">𝐏𝐚𝐬𝐊𝐚𝐋𝐋</a> |
          </span>
          Developed By
          <img src="./assets/bm logo.png" alt="BM logo" style="height:1.2rem; vertical-align:middle; margin:0 0.25rem;"/>
          <span class="bm-wrap" style="position:relative; display:inline-block;">
          <a id="bm-link" href="${inviteUrl}" target="_blank" rel="noopener noreferrer" style="color:#fff; text-decoration:none;">𝐁𝐌 𝐂𝐎𝐌𝐌𝐔𝐍𝐈𝐓𝐘</a></span>
          </span>`;

    const wrapper = footerCredit.querySelector('.bm-wrap');

    const iframe = document.createElement('iframe');
    iframe.setAttribute('scrolling', 'no');
    Object.assign(iframe.style, {
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: '100%',
        height: '22px',
        width: '120px',
        border: '0',
        borderRadius: '4px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        display: 'none',
        overflow: 'hidden',
        background: 'transparent',
        zIndex: '9999'
    });

    // small HTML inside the iframe; clicking opens invite in new tab
    iframe.srcdoc = `
      <html>
        <body style="margin:0;background:transparent;">
          <button onclick="top.open('${inviteUrl}','_blank')"
                  style="height:22px;border:0;padding:0 8px;background:linear-gradient(90deg,#ff5f6d,#ff0000);color:#fff;font-size:12px;cursor:pointer;width:100%;border-radius:4px;">
            Click to join
          </button>
        </body>
      </html>`;

    wrapper.appendChild(iframe);

    // show the iframe only when hovering the BM link/container
    wrapper.addEventListener('mouseenter', () => iframe.style.display = 'block');
    wrapper.addEventListener('mouseleave', () => iframe.style.display = 'none');
});



