particlesJS('particles-js', {
  particles: {
    number: {
      value: 60,
      density: {
        enable: true,
        value_area: 900
      }
    },
    color: {
      value: ['#00d4aa', '#00b894', '#00cec9', '#55efc4']
    },
    shape: {
      type: 'circle',
      stroke: {
        width: 0,
        color: '#000000'
      }
    },
    opacity: {
      value: 0.85,
      random: true,
      anim: {
        enable: true,
        speed: 0.8,
        opacity_min: 0.3,
        sync: false
      }
    },
    size: {
      value: 3,
      random: true,
      anim: {
        enable: true,
        speed: 2,
        size_min: 1.5,
        sync: false
      }
    },
    line_linked: {
      enable: true,
      distance: 180,
      color: '#00d4aa',
      opacity: 0.35,
      width: 1.2
    },
    move: {
      enable: true,
      speed: 0.8,
      direction: 'none',
      random: true,
      straight: false,
      out_mode: 'bounce',
      bounce: true,
      attract: {
        enable: false
      }
    }
  },
  interactivity: {
    detect_on: 'canvas',
    events: {
      onhover: {
        enable: true,
        mode: 'grab'
      },
      onclick: {
        enable: true,
        mode: 'push'
      },
      resize: true
    },
    modes: {
      grab: {
        distance: 200,
        line_linked: {
          opacity: 0.7
        }
      },
      push: {
        particles_nb: 2
      }
    }
  },
  retina_detect: true
});
