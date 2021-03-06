/**
 * Copyright (c) Areslabs.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
 
import {
    PureComponent,
    createElement,
    instanceManager,
    styleType,
    tackleWithStyleObj
} from "@areslabs/wx-react"

const {SCROLL} = styleType

//TODO 移除phblock 使用


function getGenericTemplate(tempVnode, datakey,) {
	return createElement('template', {
		datakey,
		tempVnode
	})
}

export default class WXFlatList extends PureComponent {
    scrollToOffset(position) {
        const wxInst = instanceManager.getWxInstByUUID(this.__diuu__)
        wxInst.scrollToOffset(position)
    }

    scrollTo(position) {
        const wxInst = instanceManager.getWxInstByUUID(this.__diuu__)
        wxInst.scrollTo(position)
    }

    scrollToIndex(opt) {
        const wxInst = instanceManager.getWxInstByUUID(this.__diuu__)
        wxInst.scrollToIndex(opt)
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.refreshing !== undefined && this.props.refreshing !== nextProps.refreshing) {
            const wxInst = instanceManager.getWxInstByUUID(this.__diuu__);
            wxInst.setData({
                sr: nextProps.refreshing
            })
        }
    }

    getStyleAndDiuu() {
        const {style, contentContainerStyle} = this.props
        return {
            diuu: '',
            style: tackleWithStyleObj(style, SCROLL),
            contentContainerStyle: tackleWithStyleObj(contentContainerStyle)
        }
    }


    render() {
        const {
            ListHeaderComponent,
            ListFooterComponent,
            ListEmptyComponent,
            data,
            renderItem,
            keyExtractor,
            contentContainerStyle = '',
            numColumns = 1,
            onEndReachedThreshold = 0.1,
            refreshing = false,
            horizontal = false,
            onRefresh,
            getItemLayout,
            stickyHeaderIndices = []
        } = this.props

        const children = []

        if (ListHeaderComponent) {
            const CPTVnode = ListHeaderComponent.isReactElement ? ListHeaderComponent : ListHeaderComponent()

            children.push(getGenericTemplate(CPTVnode, 'ListHeaderComponent'))
        }


        if (ListEmptyComponent && data && data.length === 0) {
            const CPTVnode = ListEmptyComponent.isReactElement ? ListEmptyComponent : ListEmptyComponent()

			children.push(getGenericTemplate(CPTVnode, 'ListEmptyComponent'))
        }


        if (data && data.length > 0) {
            const body = createElement("template", {
                datakey: "renderItem",
                tempVnode: data.map((item, index) => {
                    const CPTVnode = renderItem({
                        item,
                        index
                    })


                    let key = index
                    if (keyExtractor) {
                        key = keyExtractor(item, index)
                    } else {
                        key = item.key
                    }

                    if (CPTVnode.isReactElement) {
						CPTVnode.key = key
					}

					return CPTVnode
                }),
            })

            children.push(body)
        }


        if (ListFooterComponent) {
            const CPTVnode = ListFooterComponent.isReactElement ? ListFooterComponent : ListFooterComponent()

			children.push(getGenericTemplate(CPTVnode, 'ListFooterComponent'))
        }

        let bakStickyHeaderIndices = stickyHeaderIndices
        if (ListHeaderComponent) {
            bakStickyHeaderIndices = stickyHeaderIndices.map(e => {
                return e - 1
            })
        }
        const baseObj = {
            contentContainerStyle,
            stickyHeaderIndices: bakStickyHeaderIndices,
            numColumns,
            onEndReachedThreshold: onEndReachedThreshold * 600,
            horizontal,
            refreshing,
            onRefreshPassed: !!onRefresh,

            ...(this.getStyleAndDiuu())
        }
        const stickyInfos = []
        let topOffset = 0;
        if (Array.isArray(bakStickyHeaderIndices) && bakStickyHeaderIndices.length > 0 && typeof getItemLayout === 'function') {
            for (let k = 0; k < bakStickyHeaderIndices.length; k++) {
                const stickyHeaderIndex = bakStickyHeaderIndices[k]
                let preOffset = topOffset
                let {offset, length, index} = getItemLayout(data, stickyHeaderIndex)
                stickyInfos.push({
                    baseOffset: offset,
                    length, index, topPosition: preOffset
                });
                topOffset += length
            }
        }
        Object.assign(baseObj, {
            stickyInfos
        })
        return createElement('phblock', baseObj, ...children)
    }
}
