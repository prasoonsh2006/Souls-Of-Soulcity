var crsr = document.querySelector("#cursor");
var blur = document.querySelector("#cursor-blur");

document.addEventListener("mousemove", function (dets) {
    crsr.style.left = dets.x + "px";
    crsr.style.top = dets.y + "px";
    blur.style.left = dets.x - 250 + "px";
    blur.style.top = dets.y - 250 + "px";
});

var h4all = document.querySelectorAll("#nav");
h4all.forEach(function (elem) {
    elem.addEventListener("mouseenter", function () {
        crsr.style.scale = 3;
        crsr.style.border = "1px solid #fff";
        crsr.style.backgroundColor = "transparent";
    });
    elem.addEventListener("mouseleave", function () {
        crsr.style.scale = 1;
        crsr.style.border = "0px solid #95C11E";
        crsr.style.backgroundColor = "#95C11E";
    });
});

gsap.to("#nav", {
    backgroundColor: "rgba(0,0,0,0.5)", // darker translucent
    duration: 0.5,
    scrollTrigger: {
        trigger: "#home",
        start: "bottom top",
        toggleActions: "play none none reverse",
    },
});


gsap.to("#main", {
    backgroundColor: "#000",
    scrollTrigger: {
        trigger: "#main",
        scroller: "body",
        // markers: true,
        start: "top -25%",
        end: "top -70%",
        scrub: 2,
    },
});

gsap.from("#about-us img,#about-us-in", {
    y: 90,
    opacity: 0,
    duration: 1,
    scrollTrigger: {
        trigger: "#about-us",
        scroller: "body",
        // markers:true,
        start: "top 70%",
        end: "top 65%",
        scrub: 1,
    },
});
gsap.from(".card", {
    scale: 0.8,
    // opacity:0,
    duration: 1,
    stagger: 0.1,
    scrollTrigger: {
        trigger: ".card",
        scroller: "body",
        // markers:false,
        start: "top 70%",
        end: "top 65%",
        scrub: 1,
    },
});
gsap.from("#colon1", {
    y: -70,
    x: -70,
    scrollTrigger: {
        trigger: "#colon1",
        scroller: "body",
        // markers:true,
        start: "top 55%",
        end: "top 45%",
        scrub: 4,
    },
});
gsap.from("#colon2", {
    y: 70,
    x: 70,
    scrollTrigger: {
        trigger: "#colon1",
        scroller: "body",
        // markers:true,
        start: "top 55%",
        end: "top 45%",
        scrub: 4,
    },
});
gsap.from("#page4 h1", {
    y: 50,
    scrollTrigger: {
        trigger: "#page4 h1",
        scroller: "body",
        // markers:true,
        start: "top 75%",
        end: "top 70%",
        scrub: 3,
    },
});

// Thanks itna aage tak aane ke liye lekin pura code utha ke copy paste karne ki jagah khud ek baar banane ka try karna, kuch naya seekhne ko milega!



const navItems = document.querySelectorAll("#nav h4");
const pages = document.querySelectorAll(".page");

navItems.forEach(item => {
    item.addEventListener("click", () => {
        const targetId = item.textContent.toLowerCase(); // lowercase to match section IDs
        pages.forEach(page => page.classList.remove("active")); // hide all
        const targetPage = document.getElementById(targetId);
        if (targetPage) targetPage.classList.add("active"); // show clicked
    });
});




// Navbar logo click → go to Home
const logo = document.querySelector("#nav img");
const homePage = document.getElementById("home");

logo.addEventListener("click", () => {
    // Remove active from all pages
    pages.forEach(page => page.classList.remove("active"));

    // Activate home page
    homePage.classList.add("active");

    // Scroll to top of home considering navbar height
    const offset = 130; // navbar height
    window.scrollTo({
        top: homePage.offsetTop - offset,
        behavior: "smooth"
    });
});

// GSAP scrollTrigger to change navbar color
gsap.to("#nav", {
    backgroundColor: "rgba(255, 255, 255, 0.85)", // semi-transparent white
    duration: 0.5,
    scrollTrigger: {
        trigger: "#home",
        start: "top top",  // when scrolling begins
        end: "bottom top", // scroll distance over which it changes
        scrub: true,       // smooth gradual transition
    },
});


crsr.style.backgroundColor = "#fff";  // fill color same as border
crsr.style.opacity = "1";             // ensure fully opaque

