export function base64(url, type) {
	return new Promise((r, j) => {
		uni.getFileSystemManager().readFile({
			filePath: url,
			encoding: 'base64',
			success: res => {
				if (res.data.startsWith("data:image/")) {
					r(res.data)
				}else{
					r('data:image/' + type.toLocaleLowerCase() + ';base64,' + res.data)
				}

			},
			fail: res => {
				console.log("readFileSync fail", res);
				j(res.errMsg)
			}
		})
	})
}