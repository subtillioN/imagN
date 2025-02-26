import { h } from '@cycle/react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TagFilter } from '../../views/TagFilter';
import { createStreamTest } from '../../test/utils/stream';
import xs from 'xstream';

describe('TagFilter', () => {
  const defaultProps = {
    selectedCategories: ['category1', 'category2'],
    selectedTypes: ['type1'],
    selectedTags: ['tag1', 'tag2'],
    tagSearchQuery: '',
    availableCategories: ['category1', 'category2', 'category3'],
    availableTypes: ['type1', 'type2'],
    availableTags: ['tag1', 'tag2', 'tag3', 'tag4']
  };

  it('renders all available categories', () => {
    render(h(TagFilter, defaultProps));
    
    defaultProps.availableCategories.forEach(category => {
      expect(screen.getByText(category)).toBeInTheDocument();
    });
  });

  it('highlights selected categories', () => {
    render(h(TagFilter, defaultProps));
    
    defaultProps.selectedCategories.forEach(category => {
      const categoryChip = screen.getByText(category).parentElement;
      expect(categoryChip).toHaveClass('MuiChip-colorPrimary');
    });
  });

  it('filters tags based on search query', () => {
    const props = {
      ...defaultProps,
      tagSearchQuery: 'tag1'
    };

    render(h(TagFilter, props));
    
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.queryByText('tag3')).not.toBeInTheDocument();
  });

  it('emits events when category is clicked', () => {
    const categoryClick$ = xs.create();
    const streamTest = createStreamTest(categoryClick$);

    render(h(TagFilter, {
      ...defaultProps,
      onCategoryClick: (category: string) => categoryClick$.shamefullySendNext(category)
    }));

    fireEvent.click(screen.getByText('category1'));
    
    expect(streamTest.values).toContain('category1');
  });
}); 