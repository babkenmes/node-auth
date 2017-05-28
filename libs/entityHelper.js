var entityHelper = {
    setCommonProps: function (obj, setCreatedProps, username) {
        obj.modified = Date.now();
        obj.modifiedBy = username;
        
        if (setCreatedProps === true) {
            obj.created = Date.now();
            obj.createdBy = username;
        }
    }
}
module.exports = entityHelper;