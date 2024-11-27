/* eslint-disable function-paren-newline */
/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import './App.scss';
import cn from 'classnames';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

// eslint-disable-next-line camelcase
const sortByField = ['ID', 'Product', 'Category', 'User'];
const products = productsFromServer.map(product => {
  const category = categoriesFromServer.find(
    oneCategory => product.categoryId === oneCategory.id,
  );

  const user = usersFromServer.find(oneUser => {
    return oneUser.id === category.ownerId;
  });

  return { ...product, category, owner: user };
});

const filterandSortedProduct = (productsList, params) => {
  const {
    selectedOwner,
    selectedCategory,
    query,
    sortedByField,
    showListProducts,
  } = params;

  const filteredProduct = productsList
    .filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase().trim()),
    )
    .filter(product => {
      if (selectedOwner === 'All') return true;

      return product.owner.name === selectedOwner;
    })
    .filter(product => {
      if (selectedCategory.length === 0) return true;

      return selectedCategory.includes(product.category.title);
    });

  const sortedProduct = filteredProduct.toSorted((product1, product2) => {
    if (sortedByField === 'ID') {
      return product1.id - product2.id;
    }

    if (sortedByField === 'Product') {
      return product1.name.localeCompare(product2.name);
    }

    if (sortedByField === 'Category') {
      return product1.category.title.localeCompare(product2.category.title);
    }

    if (sortedByField === 'User') {
      return product1.owner.name.localeCompare(product2.owner.name);
    }

    return 0;
  });

  if (showListProducts === 'desc') {
    return sortedProduct.toReversed();
  }

  if (showListProducts === '') {
    return filteredProduct;
  }

  return sortedProduct || null;
};

export const App = () => {
  const [selectedOwner, setSelectedOwner] = useState('All'); // All, Roma, Anna, Max, John
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState([]); // allCategory
  const [sortedByField, setSortedByField] = useState(''); // '', ID, product, category, user
  const [showListProducts, setShowListProducts] = useState(''); // asc, desc

  const filterProducts = filterandSortedProduct(products, {
    selectedOwner,
    selectedCategory,
    query,
    sortedByField,
    showListProducts,
  });

  const onSelectedCategory = categoryTitle => {
    if (selectedCategory.includes(categoryTitle)) {
      setSelectedCategory(
        selectedCategory.filter(categ => categ !== categoryTitle),
      );
    } else {
      setSelectedCategory([...selectedCategory, categoryTitle]);
    }
  };

  const onSorted = field => {
    if (field !== sortedByField && showListProducts !== '') {
      setShowListProducts('asc');
      setSortedByField(field);
    }

    if (field !== sortedByField && showListProducts === '') {
      setShowListProducts('asc');
      setSortedByField(field);
    }

    if (field === sortedByField && showListProducts === 'asc') {
      setShowListProducts('desc');
      setSortedByField(field);
    }

    if (field === sortedByField && showListProducts === 'desc') {
      setShowListProducts('');
      setSortedByField('');
    }
  };

  const onResetFilters = () => {
    setSelectedOwner('All');
    setQuery('');
    setSelectedCategory([]);
  };

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                className={cn({ 'is-active': selectedOwner === 'All' })}
                onClick={() => setSelectedOwner('All')}
              >
                All
              </a>
              {usersFromServer.map(user => (
                <a
                  key={user.id}
                  data-cy="FilterUser"
                  href="#/"
                  className={cn({ 'is-active': user.name === selectedOwner })}
                  onClick={() => setSelectedOwner(user.name)}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                {query && (
                  <span className="icon is-right">
                    {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setQuery('')}
                    />
                  </span>
                )}
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={cn('button is-success mr-6', {
                  'is-outlined': selectedCategory.length > 0,
                })}
                onClick={() => setSelectedCategory([])}
              >
                All
              </a>

              {categoriesFromServer.map(category => (
                <a
                  key={category.id}
                  data-cy="Category"
                  className={cn('button mr-2 my-1', {
                    'is-info': selectedCategory.includes(category.title),
                  })}
                  href="#/"
                  onClick={() => onSelectedCategory(category.title)}
                >
                  {category.title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={onResetFilters}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {filterProducts.length === 0 && (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          )}
          {filterProducts.length > 0 && (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  {sortByField.map(field => (
                    <th key={field}>
                      <span className="is-flex is-flex-wrap-nowrap">
                        {field}
                        <a href="#/" onClick={() => onSorted(field)}>
                          <span className="icon">
                            <i
                              data-cy="SortIcon"
                              className={cn('fas ', {
                                'fa-sort':
                                  sortedByField !== field ||
                                  (sortedByField === field &&
                                    showListProducts === ''),
                                'fa-sort-up':
                                  showListProducts === 'asc' &&
                                  sortedByField === field,
                                'fa-sort-down':
                                  showListProducts === 'desc' &&
                                  sortedByField === field,
                              })}
                            />
                          </span>
                        </a>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filterProducts.map(product => (
                  <tr key={product.id} data-cy="Product">
                    <td className="has-text-weight-bold" data-cy="ProductId">
                      {product.id}
                    </td>

                    <td data-cy="ProductName">{product.name}</td>
                    <td data-cy="ProductCategory">
                      {product.category.icon} - {product.category.title}
                    </td>
                    <td
                      data-cy="ProductUser"
                      className={cn({
                        'has-text-link': product.owner.sex === 'm',
                        'has-text-danger': product.owner.sex === 'f',
                      })}
                    >
                      {product.owner.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
