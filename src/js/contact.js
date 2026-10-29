// Brief form. Netlify Forms receives it (data-netlify on the <form>); with JS we
// submit in place and show the confirmation, without JS it posts to /contact/thanks/.
export function initContact(form) {
  if (!form) return;
  const done = document.querySelector('[data-done]');
  const error = form.querySelector('[data-error]');

  form.addEventListener('submit', async (e) => {
    if (!form.checkValidity()) return; // let the browser show what's missing
    e.preventDefault();
    error.hidden = true;
    form.classList.add('is-sending');
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString(),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.hidden = true;
      done.hidden = false;
      done.focus();
    } catch {
      error.hidden = false;
    } finally {
      form.classList.remove('is-sending');
    }
  });
}
