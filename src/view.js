import onChange from 'on-change';

const renderFeeds = (feeds, feedsEl, pageText) => {
  if (feeds.length > 0) {
    const h2El = document.createElement('h2');
    h2El.textContent = pageText.t('feeds.title');

    const listEl = document.createElement('ul');
    listEl.classList.add('list-group', 'mb-5');

    feeds.forEach((feed) => {
      const itemEl = document.createElement('li');
      itemEl.classList.add('list-group-item');

      const h3El = document.createElement('h3');
      h3El.textContent = feed.title;

      const pEl = document.createElement('p');
      pEl.textContent = feed.desc;

      itemEl.appendChild(h3El);
      itemEl.appendChild(pEl);

      listEl.prepend(itemEl);
    });

    feedsEl.innerHTML = null;
    feedsEl.appendChild(h2El);
    feedsEl.appendChild(listEl);
  } else {
    feedsEl.innerHTML = null;
  }
};

const renderPosts = (posts, postsEl, pageText) => {
  if (posts.length > 0) {
    const h2El = document.createElement('h2');
    h2El.textContent = pageText.t('posts.title');

    const listEl = document.createElement('ul');
    listEl.classList.add('list-group');

    posts
      .sort((postA, postB) => {
        const feedIdA = Number(postA.feedId);
        const feedIdB = Number(postB.feedId);
        const postIdA = Number(postA.id);
        const postIdB = Number(postB.id);

        if ((feedIdA > feedIdB) || (feedIdA === feedIdB && postIdA < postIdB)) {
          return -1;
        }
        if ((feedIdA < feedIdB) || (feedIdA === feedIdB && postIdA > postIdB)) {
          return 1;
        }
        return 0;
      })
      .forEach((post) => {
        const itemEl = document.createElement('li');
        itemEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start-group-item');

        const aEl = document.createElement('a');
        aEl.href = post.link;
        aEl.classList.add('font-weight-bold');
        aEl.setAttribute('data-id', post.id);
        aEl.setAttribute('target', '_blank');
        aEl.setAttribute('rel', 'noopener noreferrer');
        aEl.textContent = post.title;

        const buttonEl = document.createElement('button');
        buttonEl.type = 'button';
        buttonEl.classList.add('btn', 'btn-primary', 'btn-sm');
        buttonEl.setAttribute('data-id', post.id);
        buttonEl.setAttribute('data-toggle', 'modal');
        buttonEl.setAttribute('data-target', '#modal');
        buttonEl.textContent = pageText.t('posts.preview');

        itemEl.appendChild(aEl);
        itemEl.appendChild(buttonEl);

        listEl.appendChild(itemEl);
      });

    postsEl.innerHTML = null;
    postsEl.appendChild(h2El);
    postsEl.appendChild(listEl);
  } else {
    postsEl.innerHTML = null;
  }
};

const processStateHandler = (state, stateStatuses, pageElements, processState, pageText) => {
  const { rssForm } = pageElements;
  const { feedback } = pageElements;

  const rssFormStatuses = stateStatuses.rssForm;

  switch (processState) {
    case rssFormStatuses.init:
      pageElements.title.textContent = pageText.t('title');
      pageElements.desc.textContent = pageText.t('description');
      pageElements.example.textContent = pageText.t('example');
      pageElements.rssForm.input.setAttribute('placeholder', pageText.t('rssForm.placeholder'));
      pageElements.rssForm.submit.textContent = pageText.t('rssForm.submit');
      break;
    case rssFormStatuses.submitting:
      rssForm.input.classList.remove('is-invalid');

      rssForm.fieldset.disabled = true;

      feedback.classList.remove('text-danger');
      feedback.classList.remove('text-success');
      feedback.textContent = pageText.t('feedback.submittingRSS');
      break;
    case rssFormStatuses.processed:
      rssForm.input.classList.remove('is-invalid');

      rssForm.fieldset.disabled = false;

      rssForm.input.value = null;
      rssForm.input.focus();

      feedback.classList.remove('text-danger');
      if (!feedback.classList.contains('text-success')) {
        feedback.classList.add('text-success');
      }
      feedback.textContent = state.rssForm.processMsg;

      renderFeeds(state.rssForm.data.feeds, pageElements.feeds, pageText);
      renderPosts(state.rssForm.data.posts, pageElements.posts, pageText);

      break;
    case rssFormStatuses.declined:
      if (!rssForm.input.classList.contains('is-invalid')) {
        rssForm.input.classList.add('is-invalid');
      }

      rssForm.fieldset.disabled = false;

      feedback.classList.remove('text-success');
      if (!feedback.classList.contains('text-danger')) {
        feedback.classList.add('text-danger');
      }
      feedback.textContent = state.rssForm.processMsg;
      break;
    case rssFormStatuses.refreshed:
      renderFeeds(state.rssForm.data.feeds, pageElements.feeds, pageText);
      renderPosts(state.rssForm.data.posts, pageElements.posts, pageText);

      break;
    default:
      throw new Error(`Unknown state: ${processState}`);
  }
};

export default (state, stateStatuses, pageElements, pageText) => {
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'rssForm.processState':
        processStateHandler(state, stateStatuses, pageElements, value, pageText);
        break;
      default:
        break;
    }
  });

  return watchedState;
};
