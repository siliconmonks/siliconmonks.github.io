const loader = document.getElementById('loader');
const loaderText = document.getElementById('loader-text');
const loaderMessage = 'Welcome to the siliconmonks blog';

const blogFilters = document.getElementById('blog-filters');
const blogResults = document.getElementById('blog-results');

let devToArticles = [];

function addFooterMessage() {
  const footer = document.querySelector('.site-footer');

  if (!footer || footer.querySelector('.footer-credit')) {
    return;
  }

  const credit = document.createElement('p');
  credit.className = 'footer-credit';
  credit.textContent = String.fromCharCode(169) + ' 2026 Silicon Monks. All rights reserved.';
  credit.style.margin = '18px 0 0';
  credit.style.textAlign = 'center';
  credit.style.color = 'var(--muted)';
  credit.style.fontSize = '14px';

  footer.appendChild(credit);
}

function toggleMenu() {
  document.getElementById('menu').classList.toggle('active');
}

function runLoader() {
  if (!loader || !loaderText) {
    return;
  }

  let index = 0;

  const typing = setInterval(() => {
    loaderText.textContent = loaderMessage.slice(0, index);
    index += 1;

    if (index > loaderMessage.length) {
      clearInterval(typing);

      setTimeout(() => {
        loader.classList.add('hidden');
      }, 600);
    }
  }, 75);
}

window.addEventListener('load', runLoader);

const blogCategoryMap = {
  tcl: ['tcl'],
  perl: ['perl'],
  python: ['python'],
  linux: ['linux'],
  shell: ['shell', 'bash', 'scripting'],
  verilog: ['verilog'],
  systemverilog: ['systemverilog', 'system verilog', 'sv'],
  digitalelectronics: ['digital electronics', 'digitalelectronics', 'digital', 'electronics'],
  synthesis: ['synthesis'],
  cdc: ['cdc', 'clock domain crossing'],
  integration: ['integration', 'soc integration', 'chip integration'],
  lint: ['lint'],
  lec: ['lec', 'logical equivalence', 'equivalence checking']
};

function getArticleTerms(article) {
  const tags = Array.isArray(article.tag_list) ? article.tag_list : [];

  return [
    article.title,
    article.description,
    article.tags,
    ...tags
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function articleMatchesCategory(article, category) {
  if (category === 'all') {
    return true;
  }

  const terms = getArticleTerms(article);
  return blogCategoryMap[category].some((keyword) => terms.includes(keyword));
}

function createBlogCard(article) {
  const card = document.createElement('a');
  card.className = 'blog-card';
  card.href = article.url;
  card.target = '_blank';
  card.rel = 'noopener noreferrer';

  const date = article.readable_publish_date || 'Dev.to';
  const description = article.description || 'Read this Silicon Monks post on Dev.to.';

  card.innerHTML = `
    <span>${date}</span>
    <h3>${article.title}</h3>
    <p>${description}</p>
  `;

  return card;
}

function renderBlogResults(category) {
  if (!blogResults) {
    return;
  }

  const matches = devToArticles.filter((article) => articleMatchesCategory(article, category));

  blogResults.innerHTML = '';

  if (!matches.length) {
    blogResults.innerHTML = '<p class="blog-empty">No posts found for this topic yet.</p>';
    return;
  }

  matches.forEach((article) => {
    blogResults.appendChild(createBlogCard(article));
  });
}

async function loadDevToBlogs() {
  if (!blogFilters || !blogResults) {
    return;
  }

  try {
    const response = await fetch(
      'https://dev.to/api/articles?username=silicon_monks',
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error('Unable to load Dev.to posts');
    }

    devToArticles = await response.json();
    renderBlogResults('all');
  } catch (error) {
    blogResults.innerHTML = '<p class="blog-empty">Could not load Dev.to posts right now.</p>';
  }
}

if (blogFilters) {
  blogFilters.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-category]');

    if (!button) {
      return;
    }

    blogFilters.querySelectorAll('button').forEach((filterButton) => {
      filterButton.classList.toggle('active', filterButton === button);
    });

    renderBlogResults(button.dataset.category);
  });
}

loadDevToBlogs();
addFooterMessage();
