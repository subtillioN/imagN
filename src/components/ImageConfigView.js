import { div, label, input, select, option, button } from '@cycle/dom';
import { BaseView } from '../mvi/view';

export class ImageConfigView extends BaseView {
  constructor(sources) {
    super(sources);
    this.initializeStreams();
  }

  initializeStreams() {
    this.config$ = this.sources.state.config$ || {};
    this.parameters$ = this.sources.state.parameters$ || {};
  }

  renderParameters(state) {
    return div('.parameters-section', [
      div('.parameter-group', [
        label('Image Size'),
        select('.size-select', [
          option({ value: '512x512' }, '512x512'),
          option({ value: '1024x1024' }, '1024x1024')
        ])
      ]),
      div('.parameter-group', [
        label('Style'),
        select('.style-select', [
          option({ value: 'realistic' }, 'Realistic'),
          option({ value: 'artistic' }, 'Artistic'),
          option({ value: 'abstract' }, 'Abstract')
        ])
      ]),
      div('.parameter-group', [
        label('Prompt'),
        input('.prompt-input', {
          type: 'text',
          placeholder: 'Describe your image...'
        })
      ])
    ]);
  }

  renderControls(state) {
    return div('.controls-section', [
      button('.generate-btn', 'Generate Image'),
      button('.reset-btn', 'Reset')
    ]);
  }

  renderPreview(state) {
    return div('.preview-section', [
      div('.preview-container', [
        // Preview will be implemented here
      ])
    ]);
  }

  view(state) {
    return div('.image-config-container', [
      div('.config-header', 'Image Configuration'),
      this.renderParameters(state),
      this.renderPreview(state),
      this.renderControls(state)
    ]);
  }
}