function ContentCard({title, description}) {
    return ( 
        <div className="rounded-3xl p-3 shadow-lg hover:shadow-md transition-shadow cursor-pointer">
            <div className="bg-black w-80 h-80 rounded-3xl mb-2"></div>
            <div className="font-semibold text-lg">{title}</div>
            <div className="text-s">{description}</div>
        </div>
    );
}

export default ContentCard;