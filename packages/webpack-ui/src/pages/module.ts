import { StatoscopeWidget } from '../../types';
// @ts-ignore
import styles from './split-layout.css';
import modulesTree from './default/modules-tree';
import chunksTree from './default/chunks-tree';

export default function (discovery: StatoscopeWidget): void {
  discovery.page.define('module', [
    {
      data: '#.params.hash.resolveStat()',
      view: 'switch',
      content: [
        {
          when: 'not compilation',
          content: 'stats-list',
        },
        {
          when: 'compilation',
          content: [
            {
              view: 'switch',
              data: `compilation.(..modules).[name=#.id.decodeURIComponent() or (''+id)=#.id.decodeURIComponent()][0]`,
              content: [
                {
                  when: 'not $',
                  content:
                    'alert-warning:"Module `" + #.id.decodeURIComponent() + "` not found"',
                },
                {
                  content: [
                    {
                      view: 'page-header',
                      prelude: 'badge:{ text: "Module" }',
                      content: 'h1:resolvedResource or name or id',
                    },
                    {
                      ...modulesTree(),
                    },
                    {
                      view: 'block',
                      className: styles.root,
                      content: [
                        {
                          view: 'section',
                          header: 'text:"Reasons"',
                          content: {
                            view: 'tabs',
                            name: 'reasonsTabs',
                            tabs: [
                              { value: 'modules', text: 'Modules' },
                              { value: 'issuers', text: 'Issuer Path' },
                              { value: 'chunks', text: 'Chunks' },
                            ],
                            content: {
                              view: 'content-filter',
                              content: {
                                view: 'switch',
                                content: [
                                  {
                                    when: '#.reasonsTabs="modules"',
                                    data: `
                                    $modules: reasons.resolvedModule.[];
                                    $modules.[not shouldHideModule() and name~=#.filter].sort(getModuleSize(#.params.hash).size desc)
                                    `,
                                    content: {
                                      ...modulesTree(),
                                    },
                                  },
                                  {
                                    when: '#.reasonsTabs="issuers"',
                                    data: `issuerPath.resolvedModule.[].[not shouldHideModule() and name~=#.filter]`,
                                    content: {
                                      ...modulesTree(),
                                    },
                                  },
                                  {
                                    when: '#.reasonsTabs="chunks"',
                                    data: `
                                    chunks
                                      .[chunkName()~=#.filter]
                                      .sort(initial desc, entry desc, getModuleSize(#.params.hash).size desc)
                                    `,
                                    content: {
                                      ...chunksTree(),
                                    },
                                  },
                                ],
                              },
                            },
                          },
                        },
                        {
                          view: 'section',
                          header: 'text:"Dependencies"',
                          content: {
                            view: 'tabs',
                            name: 'depsTabs',
                            tabs: [
                              { value: 'modules', text: 'Modules' },
                              { value: 'chunks', text: 'Chunks' },
                              {
                                when: 'modules',
                                value: 'concatenated',
                                text: 'Concatenated',
                              },
                            ],
                            content: {
                              view: 'content-filter',
                              content: {
                                view: 'switch',
                                content: [
                                  {
                                    when: '#.depsTabs="modules"',
                                    data: `
                                    #.params.hash.resolveStat().compilation.(..modules)
                                      .[not shouldHideModule() and name~=#.filter]
                                      .[reasons.[resolvedModule=@]]
                                      .sort(getModuleSize(#.params.hash).size desc)
                                    `,
                                    content: {
                                      ...modulesTree(),
                                    },
                                  },
                                  {
                                    when: '#.depsTabs="chunks"',
                                    data: `
                                    #.params.hash.resolveStat().compilation.(..modules).[not shouldHideModule()]
                                      .[reasons.[resolvedModule=@]]
                                      .chunks.[chunkName()~=#.filter].sort(initial desc, entry desc, size desc)
                                    `,
                                    content: {
                                      ...chunksTree(),
                                    },
                                  },
                                  {
                                    when: '#.depsTabs="concatenated"',
                                    data: `
                                    modules.[not shouldHideModule() and name~=#.filter].sort(getModuleSize(#.params.hash).size desc)
                                    `,
                                    content: {
                                      ...modulesTree(),
                                    },
                                  },
                                ],
                              },
                            },
                          },
                        },
                      ],
                    },
                    {
                      view: 'section',
                      header: 'text:"Details"',
                      content: {
                        view: 'tabs',
                        name: 'messagesTabs',
                        tabs: [{ value: 'deopts', text: 'Deoptimizations' }],
                        content: {
                          view: 'content-filter',
                          content: {
                            view: 'switch',
                            content: [
                              {
                                when: '#.messagesTabs="deopts"',
                                data: `optimizationBailout.[$~=#.filter]`,
                                content: {
                                  view: 'ul',
                                  limit: '= settingListItemsLimit()',
                                  item: {
                                    view: 'text-match',
                                    data: `{text: $, match: #.filter}`,
                                  },
                                },
                              },
                            ],
                          },
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ]);
}
